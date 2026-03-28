# Dog Walking Management – Domain Model

This document describes the core entities, their attributes, relationships,
and the business rules that govern the dog walking management domain.

---

## Entities

### User

Represents a registered user of the platform. A user has one of two roles:
**owner** or **walker**. Authentication is JWT-based.

| Attribute   | Type   | Required | Notes                          |
|-------------|--------|----------|--------------------------------|
| id          | UUID   | ✓        | System-assigned identifier     |
| email       | string | ✓        | Unique; used to log in         |
| password    | string | ✓        | Minimum 8 characters (hashed) |
| firstName   | string | ✓        |                                |
| lastName    | string | ✓        |                                |
| role        | enum   | ✓        | `owner` or `walker`            |

---

### Owner (Dog Owner)

A dog owner who uses the platform to book walks for their dogs. Linked 1-to-1
with a **User** account.

| Attribute | Type    | Required | Notes                              |
|-----------|---------|----------|------------------------------------|
| id        | UUID    | ✓        | System-assigned                    |
| firstName | string  | ✓        |                                    |
| lastName  | string  | ✓        |                                    |
| email     | string  | ✓        |                                    |
| phone     | string  | ✓        |                                    |
| address   | Address | ✗        | Embedded value object (see below)  |
| notes     | string  | ✗        | General notes (e.g. access codes)  |
| createdAt | datetime| ✓        | System-assigned                    |
| updatedAt | datetime| ✓        | System-assigned                    |

---

### Walker (Dog Walker)

A dog walker who accepts walk requests and carries out walks. Linked 1-to-1
with a **User** account.

| Attribute   | Type    | Required | Notes                              |
|-------------|---------|----------|------------------------------------|
| id          | UUID    | ✓        | System-assigned                    |
| firstName   | string  | ✓        |                                    |
| lastName    | string  | ✓        |                                    |
| email       | string  | ✓        |                                    |
| phone       | string  | ✓        |                                    |
| address     | Address | ✗        | Embedded value object              |
| bio         | string  | ✗        | Short biography for owners to read |
| ratePerHour | decimal | ✗        | Hourly rate in GBP                 |
| createdAt   | datetime| ✓        | System-assigned                    |
| updatedAt   | datetime| ✓        | System-assigned                    |

---

### Dog

A dog belonging to an **Owner**. One owner may have many dogs.

| Attribute       | Type          | Required | Notes                                      |
|-----------------|---------------|----------|--------------------------------------------|
| id              | UUID          | ✓        | System-assigned                            |
| ownerId         | UUID          | ✓        | FK → Owner                                 |
| name            | string        | ✓        |                                            |
| breed           | string        | ✓        |                                            |
| dateOfBirth     | date          | ✓        |                                            |
| sex             | enum          | ✗        | `male` or `female`                         |
| colour          | string        | ✗        |                                            |
| microchipNumber | string        | ✗        | ISO 11784/11785 identifier                 |
| vaccinations    | Vaccination[] | ✗        | List of vaccination records                |
| vetContact      | VetContact    | ✗        | Embedded value object                      |
| medicalNotes    | string        | ✗        | Conditions, medications, allergies         |
| behaviourNotes  | string        | ✗        | Temperament notes useful for walkers       |
| createdAt       | datetime      | ✓        | System-assigned                            |
| updatedAt       | datetime      | ✓        | System-assigned                            |

---

### WalkRequest

A request submitted by an **Owner** asking for a walk for one or more of their
**Dogs**. This is the entry point to the walk booking workflow. A request may
optionally nominate a preferred **Walker**.

| Attribute         | Type     | Required | Notes                                        |
|-------------------|----------|----------|----------------------------------------------|
| id                | UUID     | ✓        | System-assigned                              |
| ownerId           | UUID     | ✓        | FK → Owner                                   |
| dogIds            | UUID[]   | ✓        | FK[] → Dog (≥1 dog per request)              |
| preferredWalkerId | UUID     | ✗        | FK → Walker; optional preference             |
| requestedDate     | date     | ✓        |                                              |
| requestedStartTime| time     | ✓        | RFC 3339 time (`HH:MM:SS`)                   |
| durationMinutes   | integer  | ✓        | 15–240 minutes                               |
| notes             | string   | ✗        | Special instructions for the walker          |
| status            | enum     | ✓        | See **WalkRequest status lifecycle** below   |
| declineReason     | string   | ✗        | Populated when status = `declined`           |
| walkId            | UUID     | ✗        | FK → Walk; set when request is accepted      |
| createdAt         | datetime | ✓        | System-assigned                              |
| updatedAt         | datetime | ✓        | System-assigned                              |

#### WalkRequest status lifecycle

```
pending ──► accepted ──► (Walk is created)
        │
        └──► declined
        │
        └──► cancelled
```

---

### Walk

A scheduled (or completed/cancelled) walk. Created automatically when a
**Walker** accepts a **WalkRequest**. A walk belongs to exactly one **Owner**,
one **Walker**, and one or more **Dogs**.

| Attribute          | Type     | Required | Notes                                   |
|--------------------|----------|----------|-----------------------------------------|
| id                 | UUID     | ✓        | System-assigned                         |
| requestId          | UUID     | ✓        | FK → WalkRequest                        |
| ownerId            | UUID     | ✓        | FK → Owner                              |
| walkerId           | UUID     | ✓        | FK → Walker                             |
| dogIds             | UUID[]   | ✓        | FK[] → Dog                              |
| scheduledDate      | date     | ✓        |                                         |
| scheduledStartTime | time     | ✓        | RFC 3339 time (`HH:MM:SS`)             |
| durationMinutes    | integer  | ✓        |                                         |
| status             | enum     | ✓        | See **Walk status lifecycle** below     |
| routeNotes         | string   | ✗        | Planned route description               |
| actualStartTime    | datetime | ✗        | Populated on completion                 |
| actualEndTime      | datetime | ✗        | Populated on completion                 |
| distanceKm         | decimal  | ✗        | Populated on completion                 |
| summaryNotes       | string   | ✗        | Walker's post-walk summary              |
| cancelReason       | string   | ✗        | Populated when status = `cancelled`     |
| createdAt          | datetime | ✓        | System-assigned                         |
| updatedAt          | datetime | ✓        | System-assigned                         |

#### Walk status lifecycle

```
scheduled ──► in_progress ──► completed
          │
          └──────────────────► cancelled
```

---

### WalkUpdate

A real-time update posted by a **Walker** during a walk. Supports two types:
a text **note** or a photo **image**. An unlimited number of updates can be
posted per walk.

| Attribute    | Type     | Required | Notes                                          |
|--------------|----------|----------|------------------------------------------------|
| id           | UUID     | ✓        | System-assigned                                |
| walkId       | UUID     | ✓        | FK → Walk                                      |
| type         | enum     | ✓        | `note` or `image`                              |
| note         | string   | ✗        | Required when `type = note`                    |
| imageUrl     | string   | ✗        | URL of stored image; required when `type = image` |
| imageCaption | string   | ✗        | Optional caption for an image update           |
| createdAt    | datetime | ✓        | System-assigned                                |

---

### Invoice

An invoice raised by a **Walker** against an **Owner** for one or more
completed **Walks**. Each walk appears as a line item.

| Attribute       | Type             | Required | Notes                                       |
|-----------------|------------------|----------|---------------------------------------------|
| id              | UUID             | ✓        | System-assigned                             |
| invoiceNumber   | string           | ✗        | Human-readable reference (e.g. INV-2025-42) |
| ownerId         | UUID             | ✓        | FK → Owner                                  |
| walkerId        | UUID             | ✓        | FK → Walker                                 |
| lineItems       | InvoiceLineItem[]| ✓        | ≥1 line item; each linked to a Walk         |
| subtotal        | decimal          | ✓        | Sum of all line item totals                 |
| taxRate         | decimal          | ✗        | Percentage; defaults to 0                   |
| taxAmount       | decimal          | ✓        | Calculated from subtotal × taxRate          |
| total           | decimal          | ✓        | subtotal + taxAmount                        |
| dueDate         | date             | ✓        |                                             |
| status          | enum             | ✓        | See **Invoice status lifecycle** below      |
| notes           | string           | ✗        | Free-text notes on the invoice              |
| paidAt          | datetime         | ✗        | Populated when status = `paid`              |
| paymentMethod   | enum             | ✗        | `bank_transfer`, `card`, `cash`, `other`    |
| paymentReference| string           | ✗        | Transaction ID or reference                 |
| createdAt       | datetime         | ✓        | System-assigned                             |
| updatedAt       | datetime         | ✓        | System-assigned                             |

#### Invoice status lifecycle

```
draft ──► sent ──► paid
      │       │
      │       └──► overdue
      │
      └──► cancelled
```

---

### InvoiceLineItem (value object)

An individual line on an **Invoice**, representing one completed walk.

| Attribute   | Type    | Required | Notes                          |
|-------------|---------|----------|--------------------------------|
| walkId      | UUID    | ✓        | FK → Walk                      |
| description | string  | ✓        | Human-readable line description|
| quantity    | decimal | ✓        | E.g. hours walked              |
| unitPrice   | decimal | ✓        | Walker's rate per unit in GBP  |
| total       | decimal | ✓        | Calculated: quantity × unitPrice |

---

## Value Objects

Value objects are embedded within entities and have no independent identity.

### Address

Used by **Owner** and **Walker** (and **VetContact**).

| Attribute | Type   |
|-----------|--------|
| line1     | string |
| line2     | string |
| city      | string |
| postcode  | string |
| country   | string |

### Vaccination

Embedded in **Dog** as a list.

| Attribute        | Type   | Required |
|------------------|--------|----------|
| name             | string | ✓        |
| dateAdministered | date   | ✓        |
| nextDueDate      | date   | ✗        |

### VetContact

Embedded in **Dog**.

| Attribute | Type    | Required |
|-----------|---------|----------|
| name      | string  | ✗        |
| phone     | string  | ✗        |
| address   | Address | ✗        |

---

## Entity Relationship Diagram

```
┌──────────┐          ┌──────────┐
│   User   │          │   User   │
│ (owner)  │          │ (walker) │
└────┬─────┘          └────┬─────┘
     │ 1                   │ 1
     │                     │
     ▼ 1                   ▼ 1
┌──────────┐          ┌──────────┐
│  Owner   │          │  Walker  │
└────┬─────┘          └────┬─────┘
     │ 1                   │ 1
     │                     │
     ├─── 1..* ──────────► │
     │    WalkRequest       │
     │    (preferred        │
     │     walker, opt.)    │
     │                     │
     │ 1                   │
     ▼ *                   │
┌──────────┐               │
│   Dog    │               │
└────┬─────┘               │
     │ *                   │ *
     │                     │
     └──────── * ──────────┘
                Walk
                │ 1
                │
                ▼ *
          ┌────────────┐
          │ WalkUpdate │
          │(note/image)│
          └────────────┘

Owner ──── 1 ──► * ──── Invoice ──── * ──► 1 ──── Walker
                             │
                             │ 1..* line items
                             ▼
                         Walk (completed)
```

---

## Aggregate Boundaries

| Aggregate Root | Contains                        |
|----------------|---------------------------------|
| Owner          | Owner profile, Address          |
| Walker         | Walker profile, Address         |
| Dog            | Dog details, Vaccination[], VetContact |
| WalkRequest    | Request details and status      |
| Walk           | Walk schedule, status, WalkUpdate[] |
| Invoice        | Invoice header, InvoiceLineItem[] |

---

## Key Business Rules

1. **One or more dogs per request** – A `WalkRequest` must include at least one dog, and all dogs must belong to the requesting owner.
2. **Walk created on acceptance** – A `Walk` is only created when a `WalkRequest` transitions to `accepted`. Each request produces at most one walk.
3. **Walk updates during active walks** – `WalkUpdate` records (notes and images) are intended to be posted while a walk's status is `in_progress`.
4. **Invoice per owner/walker pair** – An invoice is raised by a walker against a specific owner and references one or more of their completed walks.
5. **Line item totals** – Each `InvoiceLineItem.total` is derived from `quantity × unitPrice`. The invoice `subtotal` is the sum of all line item totals; `total = subtotal + taxAmount`.
6. **Preferred walker** – An owner may nominate a preferred walker on a `WalkRequest`, but any available walker may accept an open request.
7. **Walk duration limits** – Walk duration must be between 15 and 240 minutes.
8. **Password policy** – Passwords must be at least 8 characters.
