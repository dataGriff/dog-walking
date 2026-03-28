# Stardogwalker Docs

A product specification and OpenAPI contract for the **Stardogwalker** dog walking management platform — Cardiff, South Wales.

## Documentation

| Document | Description |
|---|---|
| [Product Requirements](prd.md) | Problem statement, personas, user stories, and goals |
| [Domain Model](domain-model.md) | Domain entities, relationships, business rules, and aggregate boundaries |
| [Auth Matrix](auth-matrix.md) | Authorisation matrix — which roles can perform which operations |
| [Sequence Diagrams](sequence-diagrams.md) | Mermaid sequence diagrams for all key interaction flows |
| [**Interactive API Reference →**](api-reference.html) | Full REST API contract with live try-it-out and multi-language code samples |

## Overview

The API covers all aspects of a dog walking service, including:

- **Authentication** – Register, log in, refresh tokens, and log out (JWT-based)
- **Dog Owners** – Full CRUD management of dog owner profiles
- **Dog Walkers** – Full CRUD management of dog walker profiles
- **Dogs** – Full CRUD management of dog details, including medical and vaccination records, nested under their owner
- **Walk Requests** – Owners submit walk requests; walkers accept or decline them
- **Walks** – Scheduled walks created from accepted requests; walkers can start, complete, or cancel walks
- **Walk Updates** – Walkers post real-time notes and images during a walk, keeping owners engaged
- **Invoices** – Walkers raise invoices for completed walks; owners can view and pay them

## API Contract

The raw OpenAPI 3.0.3 spec is at [`contracts/openapi.yaml`](contracts/openapi.yaml).
