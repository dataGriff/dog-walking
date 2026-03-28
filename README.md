# dog-walking

A product specification and OpenAPI contract for the **Stardogwalker** dog
walking management platform — Cardiff, South Wales.

## Documentation

Published at **https://datagriff.github.io/dog-walking/**

| Document | Description |
|---|---|
| [`docs/prd.md`](./docs/prd.md) | Product Requirements Document — problem statement, personas, user stories, and goals |
| [`docs/domain-model.md`](./docs/domain-model.md) | Domain entities, relationships, business rules, and aggregate boundaries |
| [`docs/contracts/openapi.yaml`](./docs/contracts/openapi.yaml) | Full REST API contract (OpenAPI 3.0.3) |
| [`docs/auth-matrix.md`](./docs/auth-matrix.md) | Authorisation matrix — which roles can perform which operations |
| [`docs/sequence-diagrams.md`](./docs/sequence-diagrams.md) | Mermaid sequence diagrams for all key interaction flows |

## Overview

The API covers all aspects of a dog walking service — interest registration,
authentication, owner/walker/dog management, walk requests, walk scheduling
and execution, real-time walk updates, recurring walks, and invoicing.

See the [published documentation](https://datagriff.github.io/dog-walking/)
for the full feature overview, interactive API reference, and all supporting
documents.

## API Specification

The contract is defined in [`docs/contracts/openapi.yaml`](./docs/contracts/openapi.yaml) using the [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3) standard.

You can explore the spec interactively using any OpenAPI-compatible tool, for example:

```bash
# Using Swagger UI via Docker
docker run -p 8080:8080 -e SWAGGER_JSON=/spec/openapi.yaml \
  -v $(pwd)/docs/contracts:/spec swaggerapi/swagger-ui
```

Then open http://localhost:8080 in your browser.

### Linting

The spec is linted with [Spectral](https://stoplight.io/open-source/spectral) against the built-in `spectral:oas` ruleset:

```bash
npm install -g @stoplight/spectral-cli
spectral lint docs/contracts/openapi.yaml
```

## Running Docs Locally

```bash
pip install mkdocs-material
mkdocs serve
```

Then open http://localhost:8000 in your browser. The site live-reloads on any file change.
