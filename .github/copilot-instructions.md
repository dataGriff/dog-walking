# Stardogwalker – Workspace Instructions

## Documentation Hierarchy

This project has two tiers of documentation. **Specifications are the source of truth — code must conform to them, not the other way around.**

| Tier | Location | Purpose | Change frequency |
|------|----------|---------|-----------------|
| **Specifications** | `docs/specifications/` | Authoritative business requirements | Low — deliberate, reviewed |
| **Implementation docs** | `docs/implementation/` | API references, dev guides, rendered artefacts | Higher — generated or iterative |

When implementing or modifying any feature, always consult the relevant spec documents first:

- [`docs/specifications/prd.md`](docs/specifications/prd.md) — Product requirements, personas, user stories
- [`docs/specifications/domain-model.md`](docs/specifications/domain-model.md) — Entities, attributes, relationships, business rules
- [`docs/specifications/auth-matrix.md`](docs/specifications/auth-matrix.md) — Who can do what; role-based access rules
- [`docs/specifications/sequence-diagrams.md`](docs/specifications/sequence-diagrams.md) — Key interaction flows
- [`docs/specifications/contracts/openapi.yaml`](docs/specifications/contracts/openapi.yaml) — REST API contract (authoritative)
- [`docs/specifications/contracts/asyncapi.yaml`](docs/specifications/contracts/asyncapi.yaml) — Domain events contract (authoritative)

## Core Rules

1. **Specs drive code.** If code diverges from a spec, fix the code — not the spec. Only change a spec when there is a deliberate business decision to do so.
2. **Do not edit `docs/specifications/` incidentally.** Spec changes require explicit intent and should be reviewed separately from code changes.
3. **Domain model is authoritative for naming.** Entity names, attribute names, and relationship names defined in `docs/specs/domain-model.md` must be used consistently in code (routes, models, tests, variables).
4. **Auth matrix is authoritative for access control.** All authorization logic in `api/middleware/` and route handlers must match `docs/specs/auth-matrix.md` exactly.
5. **OpenAPI contract is authoritative for the REST API.** Request/response shapes, status codes, and route paths must match `docs/specs/contracts/openapi.yaml`.

## Architecture

- **API**: Node.js/Express in `api/`. Entry point `api/src/server.js`, app config `api/src/app.js`.
- **Auth**: JWT-based. Middleware in `api/src/middleware/authenticate.js`.
- **Routes**: One file per resource in `api/src/routes/`.
- **Store**: In-memory store in `api/src/store.js` (no database).
- **Tests**: Per-route test files in `api/tests/`. Use helpers from `api/tests/helpers.js`.

## Build and Test

```bash
task api:install   # install dependencies
task api:test      # run all tests
task lint          # lint OpenAPI + AsyncAPI contracts
```
