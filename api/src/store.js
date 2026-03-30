const db = require('./db');

// Permitted table names — used to guard against accidental misuse.
const ALLOWED_TABLES = new Set([
  'kv_users', 'kv_owners', 'kv_walkers', 'kv_dogs',
  'kv_interest_requests', 'kv_walk_requests', 'kv_walks',
  'kv_walk_updates', 'kv_recurring_walks', 'kv_invoices',
]);

/**
 * Map-like wrapper backed by a SQLite key-value table.
 * Each row stores the full serialised JSON object so that the rest of the
 * codebase can continue using the same .get() / .set() / .delete() / .values()
 * interface without any changes.
 */
class SQLiteMap {
  constructor(tableName) {
    if (!ALLOWED_TABLES.has(tableName)) {
      throw new Error(`SQLiteMap: unknown table '${tableName}'`);
    }
    this._table = tableName;
    this._get = db.prepare(`SELECT data FROM ${tableName} WHERE id = ?`);
    this._set = db.prepare(`INSERT OR REPLACE INTO ${tableName} (id, data) VALUES (?, ?)`);
    this._delete = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
    this._all = db.prepare(`SELECT data FROM ${tableName}`);
    this._clear = db.prepare(`DELETE FROM ${tableName}`);
  }

  get(id) {
    const row = this._get.get(id);
    return row ? JSON.parse(row.data) : undefined;
  }

  set(id, value) {
    this._set.run(id, JSON.stringify(value));
    return this;
  }

  delete(id) {
    this._delete.run(id);
    return true;
  }

  /** Returns an array (iterable) of all stored objects. */
  values() {
    return this._all.all().map(row => JSON.parse(row.data));
  }

  _clearAll() {
    this._clear.run();
  }
}

const store = {
  users: new SQLiteMap('kv_users'),
  owners: new SQLiteMap('kv_owners'),
  walkers: new SQLiteMap('kv_walkers'),
  dogs: new SQLiteMap('kv_dogs'),
  interestRequests: new SQLiteMap('kv_interest_requests'),
  walkRequests: new SQLiteMap('kv_walk_requests'),
  walks: new SQLiteMap('kv_walks'),
  walkUpdates: new SQLiteMap('kv_walk_updates'),
  recurringWalks: new SQLiteMap('kv_recurring_walks'),
  invoices: new SQLiteMap('kv_invoices'),
};

// Pre-prepared statements for the invoice counter
const _counterGet = db.prepare('SELECT value FROM kv_counters WHERE name = ?');
const _counterSet = db.prepare('INSERT OR REPLACE INTO kv_counters (name, value) VALUES (?, ?)');
const _counterClear = db.prepare('DELETE FROM kv_counters');

// invoiceCounter is stored as a named counter row in kv_counters
Object.defineProperty(store, 'invoiceCounter', {
  get() {
    const row = _counterGet.get('invoiceCounter');
    return row ? row.value : 0;
  },
  set(value) {
    _counterSet.run('invoiceCounter', value);
  },
  enumerable: true,
  configurable: true,
});

function resetStore() {
  store.users._clearAll();
  store.owners._clearAll();
  store.walkers._clearAll();
  store.dogs._clearAll();
  store.interestRequests._clearAll();
  store.walkRequests._clearAll();
  store.walks._clearAll();
  store.walkUpdates._clearAll();
  store.recurringWalks._clearAll();
  store.invoices._clearAll();
  _counterClear.run();
}

module.exports = { store, resetStore };
