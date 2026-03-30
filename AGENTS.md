# Stardogwalker – Workspace Instructions

## Documentation Hierarchy

This project has two tiers of documentation. **Specifications are the source of truth — code must conform to them, not the other way around.**

| Tier | Location | Purpose | Change frequency |
|------|----------|---------|-----------------|
| **Specifications** | `docs/specifications/` | Authoritative business requirements and rendered contract viewers | Low — deliberate, reviewed |

When implementing or modifying any feature, consult the relevant spec documents. [`docs/index.md`](docs/index.md) is the source of truth for all documentation navigation — both agents and humans start there.

## Core Rules

1. **Specs drive code.** If code diverges from a spec, fix the code — not the spec. Only change a spec when there is a deliberate business decision to do so.
2. **Do not edit `docs/specifications/` incidentally.** Spec changes require explicit intent and should be reviewed separately from code changes.
3. **Domain model is authoritative for naming.** Entity names, attribute names, and relationship names defined in `docs/specifications/domain-model.md` must be used consistently in code (routes, models, tests, variables).
4. **Auth matrix is authoritative for access control.** All authorization logic in `api/middleware/` and route handlers must match `docs/specifications/auth-matrix.md` exactly.
5. **OpenAPI contract is authoritative for the REST API.** Request/response shapes, status codes, and route paths must match `docs/specifications/contracts/openapi.yaml`.

## Architecture

- **API**: Node.js/Express in `api/`. Entry point `api/src/server.js`, app config `api/src/app.js`.
- **Auth**: JWT-based. Middleware in `api/src/middleware/authenticate.js`.
- **Routes**: One file per resource in `api/src/routes/`.
- **Store**: In-memory store in `api/src/store.js` (no database).
- **Tests**: Per-route test files in `api/tests/`. Use helpers from `api/tests/helpers.js`.

## Build and Test

All commands must be run via `task`. Never run raw `npm`, `curl`, `spectral`, `mkdocs`, or other CLI commands directly when an equivalent task exists.

```bash
task               # list all available tasks
task api:install   # install dependencies
task api:test      # run all tests
task lint          # lint OpenAPI + AsyncAPI contracts
task api:demo      # run the full end-to-end demo
task docs:serve    # serve docs locally
```

**Task-first rule (for agents and humans):**
1. Run `task --list` (or `task`) to discover what already exists.
2. Use the matching task — do not re-implement it as an ad-hoc command.
3. If no task exists for the operation, **add one to the appropriate Taskfile** before running it. See `.github/instructions/taskfile.instructions.md` for conventions.

Tasks live in:
- `Taskfile.yml` — project-wide tasks (lint, docs, top-level api shortcuts)
- `Taskfile.api.yml` — API-specific tasks (routes, demo workflow, state management)

## Detailed Instructions

The `.github/instructions/` directory contains file-scoped rules that GitHub Copilot loads automatically based on the files in context. Other agents should read these manually when working on matching areas:

| File | Read when working on |
|------|----------------------|
| `.github/instructions/specs.instructions.md` | Anything in `docs/specifications/` |
| `.github/instructions/api-implementation.instructions.md` | Anything in `api/` |
| `.github/instructions/taskfile.instructions.md` | `Taskfile.yml` or `Taskfile.api.yml` |
