# Database — Design, Practices & Production Deployment

**Last updated:** March 2026

This document explains why SQLite was chosen as the database for the Stardogwalker API, the coding practices applied in the implementation, and how to operate it safely in production.

---

## Why SQLite?

Stardogwalker is a sole-trader business serving a small, localised client base in Cardiff. The platform requirements — at this stage — fit comfortably within what a single SQLite file can handle:

| Consideration | Assessment |
|---|---|
| **Concurrency** | One professional walker, a handful of dog owners. Peak concurrent writes are negligible. |
| **Infrastructure** | SQLite requires zero server setup, zero networking, and zero connection pooling — perfectly aligned with a low-ops, low-cost deployment. |
| **Operational simplicity** | The database is a single file. Backup, restore, and inspection are trivial. |
| **Reliability** | SQLite is one of the most battle-tested pieces of software in existence. It is used in aircraft, browsers, smartphones, and embedded devices at massive scale. |
| **Development parity** | Tests run against an in-memory SQLite database (`:memory:`), so the same engine is exercised in CI and in production — no mocking, no subtle divergence. |
| **Migration path** | The data layer is isolated behind a thin `SQLiteMap` interface. If the business outgrows SQLite (e.g. multiple walkers, multiple locations), the store can be re-implemented behind the same interface without touching any route or business logic. |

### When to reconsider

SQLite becomes a bottleneck when:

- **Write concurrency increases significantly** — SQLite serialises all writes; under sustained multi-process write load, a client-server database (e.g. PostgreSQL) will perform better.
- **The API must run across multiple server instances** — SQLite is a local-file database; you cannot safely share one file across several Node.js processes on different machines.
- **Advanced query requirements emerge** — full-text search, geospatial queries, or complex multi-table joins are better served by a purpose-built RDBMS.

---

## Implementation Practices

### Key-value schema

Each entity (walkers, owners, dogs, etc.) is stored in its own table with two columns: `id TEXT PRIMARY KEY` and `data TEXT NOT NULL`. The full JSON object is serialised into the `data` column.

This approach:
- Keeps the schema stable as entity shapes evolve (no migrations for new optional fields).
- Mirrors the original in-memory `Map` interface so no route code had to change.

```sql
CREATE TABLE IF NOT EXISTS kv_walkers (
  id   TEXT PRIMARY KEY,
  data TEXT NOT NULL
);
```

### WAL journal mode

[Write-Ahead Logging (WAL)](https://www.sqlite.org/wal.html) is enabled on every connection:

```js
db.pragma('journal_mode = WAL');
```

Benefits over the default rollback journal:

- **Readers never block writers, writers never block readers** — better perceived latency under mixed load.
- **Faster writes** — appending to a WAL file is faster than overwriting pages in place.
- **Better crash recovery** — WAL checkpoints are atomic; an interrupted write does not corrupt previously committed data.

### Foreign key enforcement

```js
db.pragma('foreign_keys = ON');
```

SQLite does not enforce foreign keys unless this pragma is set on every connection. It is set explicitly so that accidental orphan records are prevented if relationships are formalised in a future schema.

### Pre-prepared statements

All SQL statements are compiled once at startup and reused:

```js
this._get    = db.prepare(`SELECT data FROM ${tableName} WHERE id = ?`);
this._set    = db.prepare(`INSERT OR REPLACE INTO ${tableName} (id, data) VALUES (?, ?)`);
this._delete = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
```

Prepared statements are faster (compiled once, executed many times) and prevent SQL injection — user-controlled values are always passed as bound parameters, never interpolated into the query string.

### Table name whitelist

Although table names are not user input, `SQLiteMap` validates every table name against a known allowlist before preparing statements:

```js
const ALLOWED_TABLES = new Set([
  'kv_users', 'kv_owners', 'kv_walkers', /* … */
]);

if (!ALLOWED_TABLES.has(tableName)) {
  throw new Error(`SQLiteMap: unknown table '${tableName}'`);
}
```

This prevents any accidental misuse from propagating silently.

### Test isolation

Jest sets `NODE_ENV=test` automatically. The database module checks this flag and uses `:memory:` instead of a file:

```js
const dbPath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : (process.env.DB_PATH || path.join(__dirname, '../../dog-walking.db'));
```

Each test suite calls `resetStore()` in `beforeEach`, which truncates all tables. Because `:memory:` creates an isolated database per process, there is no state leakage between test runs.

---

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `DB_PATH` | `<repo-root>/dog-walking.db` | Absolute or relative path to the SQLite database file. Override to place the file on a dedicated volume. |
| `NODE_ENV` | *(unset)* | Set to `test` to use `:memory:` (done automatically by Jest). |

---

## Production Deployment Practices

### 1. Store the database file on a persistent volume

The database file **must not** be stored inside a container image or any ephemeral filesystem layer. Use a named Docker volume or a cloud-managed persistent disk:

```yaml
# docker-compose.yml example
services:
  api:
    image: dog-walking-api
    environment:
      DB_PATH: /data/dog-walking.db
    volumes:
      - db-data:/data

volumes:
  db-data:
```

### 2. Take regular backups

SQLite provides a safe online backup command. Run it on a schedule (e.g. via cron or a sidecar container):

```bash
# Safe hot backup — works even while the API is running
sqlite3 /data/dog-walking.db ".backup /backups/dog-walking-$(date +%Y%m%d-%H%M%S).db"
```

Alternatively, use the [SQLite Online Backup API](https://www.sqlite.org/backup.html) or copy the WAL-mode file using `VACUUM INTO`:

```bash
sqlite3 /data/dog-walking.db "VACUUM INTO '/backups/dog-walking-snapshot.db'"
```

Keep at least 7 days of backups and test restoration periodically.

### 3. Set correct file permissions

The database file (and its `-shm` / `-wal` siblings) should be readable and writable only by the API process user:

```bash
chown api:api /data/dog-walking.db
chmod 600 /data/dog-walking.db
```

### 4. Do not run multiple write-heavy API instances against the same file

SQLite serialises all writes using a file lock. Running several Node.js API processes pointing at the same database file is **safe for reads** but will cause write contention and can lead to `SQLITE_BUSY` errors under load. If horizontal scaling becomes necessary, migrate to PostgreSQL and update `db.js` accordingly.

### 5. Monitor WAL file size

In WAL mode, SQLite creates two companion files alongside the main database: `<name>.db-shm` (shared memory) and `<name>.db-wal` (write-ahead log). The WAL file grows with every write and is checkpointed (flushed back into the main database) automatically. If the API process is killed abruptly and the WAL is never checkpointed, it can grow large. Run an explicit checkpoint on startup or on a schedule:

```js
// In db.js, after creating the connection:
db.pragma('wal_checkpoint(TRUNCATE)');
```

Or via CLI:

```bash
sqlite3 /data/dog-walking.db "PRAGMA wal_checkpoint(TRUNCATE);"
```

### 6. Set a busy timeout

Under rare concurrent access, SQLite may return `SQLITE_BUSY`. Set a timeout so the driver retries automatically instead of throwing immediately:

```js
db.pragma('busy_timeout = 5000'); // wait up to 5 seconds before giving up
```

Add this line to `api/src/db.js` if contention is observed in production logs.

### 7. Use a read-only connection for reporting

If you add any reporting, analytics, or export endpoints in the future, open a second `better-sqlite3` connection in read-only mode so it cannot accidentally corrupt the write connection:

```js
const readonlyDb = new Database(dbPath, { readonly: true });
```

---

## Inspecting the Database

```bash
# Open the SQLite shell
sqlite3 /data/dog-walking.db

# List all tables
.tables

# Count walkers
SELECT COUNT(*) FROM kv_walkers;

# Inspect a specific walker (pretty-print JSON)
SELECT json(data) FROM kv_walkers LIMIT 1;

# Exit
.quit
```
