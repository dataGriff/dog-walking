# Stardogwalker Docs

A product specification, OpenAPI contract, and reference API implementation for the **Stardogwalker** dog walking management platform — Cardiff, South Wales.

This is the source of truth for documentation navigation — both humans and agents start here.

## Documentation

| Document | Description |
|---|---|
| [Product Requirements](specifications/prd.md) | Problem statement, personas, user stories, and goals |
| [Domain Model](specifications/domain-model.md) | Domain entities, relationships, business rules, and aggregate boundaries |
| [Auth Matrix](specifications/auth-matrix.md) | Authorisation matrix — which roles can perform which operations |
| [Sequence Diagrams](specifications/sequence-diagrams.md) | Mermaid sequence diagrams for all key interaction flows |
| [**Interactive API Reference →**](specifications/api-reference.html) | Full REST API contract with live try-it-out and multi-language code samples |
| [**AsyncAPI Event Reference →**](specifications/asyncapi-reference.html) | Full domain event catalogue with CloudEvents 1.0 schemas and AMQP channel bindings |

## Overview

The API covers all aspects of a dog walking service, including:

- **Authentication** – Register, log in, refresh tokens, and log out (JWT-based)
- **Interest Requests** – Public interest registration form and walker backlog management
- **Dog Owners** – Full CRUD management of dog owner profiles
- **Dog Walkers** – Full CRUD management of dog walker profiles
- **Dogs** – Full CRUD management of dog details, including medical and vaccination records, nested under their owner
- **Walk Requests** – Owners submit walk requests; walkers accept or decline them
- **Walks** – Scheduled walks created from accepted requests; walkers can start, complete, or cancel walks
- **Walk Updates** – Walkers post real-time notes and images during a walk, keeping owners engaged
- **Recurring Walks** – Owners set up recurring walk schedules; the system generates walk requests automatically
- **Invoices** – Walkers raise invoices for completed walks; owners can view and pay them

## API Contracts

The raw OpenAPI 3.0.3 spec is at [`specifications/contracts/openapi.yaml`](specifications/contracts/openapi.yaml).

The AsyncAPI 2.6.0 event contract is at [`specifications/contracts/asyncapi.yaml`](specifications/contracts/asyncapi.yaml).
