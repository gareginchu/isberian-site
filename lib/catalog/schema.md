# Catalog Postgres schema (proposed)

> Status: **proposal**, not migrated. The real schema lands when Isberian stands up the dedicated
> catalog Postgres DB (Plan A in `CLAUDE.md` → "Inventory feed — the critical dependency"). Until
> then the `FixtureCatalogSource` is authoritative for dev. This document is the educated guess
> that `PostgresCatalogSource` will be wired against.
>
> Field names mirror the canonical TypeScript shape in [`lib/catalog/types.ts`](./types.ts) (which
> re-exports `Rug` / `RugDescription` from [`lib/types/rug.ts`](../types/rug.ts)). When the real
> feed lands, the mapper job is to project the upstream payload into these columns, not to change
> the public types.

## Design notes

- **No price column. Ever.** Per Rule 1 in `CLAUDE.md`, the catalog DB does not store, expose, or
  expose-by-omission any dollar figure. Quote intent routes to the lead/booking funnel, never to a
  price field. If the upstream feed ships a price, the ingestion mapper drops it on the floor.
- **`status` is categorical, not monetary.** `available | on-memo | sold | draft`. That is the
  *only* sale-state signal the public site ever sees.
- **Provenance is verifiable.** Every claim about origin / age / knot density / weaver has a
  `verified` boolean so the editor queue can hold unverified claims in draft.
- **Embeddings live alongside the row** (pgvector) but are server-only — never serialized to the
  client. Both a text embedding and an image embedding column are reserved.
- **Images are denormalized into a child table**, ordered, with descriptive alt text (a11y +
  AI parsing). The primary image is flagged.
- **Showroom/location is an enum-with-room-to-grow** — Chicago and Evanston today; the model
  allows additional locations without a migration of the enum if we use a lookup table.
- **Slugs are stable** (the public URL). `id` is the internal stable handle. Both unique.

## Tables

### `rugs`

The single row per physical piece. One-to-many to `rug_images`, `rug_color_chips`,
`rug_design_features`, `rug_distinguishing_notes`.

| column                  | type                          | notes                                                       |
| ----------------------- | ----------------------------- | ----------------------------------------------------------- |
| `id`                    | `text` primary key            | stable internal id, e.g. `rug-17109`                        |
| `slug`                  | `text` unique not null        | public URL segment                                          |
| `title`                 | `text` not null               | editorial title                                             |
| `status`                | `rug_status` not null         | enum: `available`, `on-memo`, `sold`, `draft`               |
| `collection_slug`       | `text` nullable               | soft FK to `collections.slug`                               |
| `showroom_location`     | `showroom_location` nullable  | enum: `chicago`, `evanston`, `warehouse` (lookup tbl ok)    |
| `draft`                 | `boolean` not null default true | editor must flip false to publish                          |
| `description_lead`      | `text` not null               | ≤ 240 chars, structured `RugDescription.lead`               |
| `size_imperial`         | `text` not null               | e.g. `9'2" × 12'4"`                                         |
| `size_metric`           | `text` not null               | e.g. `2.79 × 3.76 m`                                        |
| `technique`             | `rug_technique` not null      | enum: hand-knotted, hand-woven (flatweave), tufted, loomed  |
| `materials`             | `rug_material[]` not null     | enum array: wool, silk, wool&silk, cotton, linen, hemp, jute |
| `pile`                  | `text` not null               | `Low` / `Medium` / `High`                                   |
| `knot_density_kpsi`     | `integer` nullable            | knots per square inch                                       |
| `knot_density_verified` | `boolean` nullable            | editor sign-off                                             |
| `age_circa`             | `text` nullable               | `c. 1890` / `1888` / `Mid-20th century`                     |
| `age_verified`          | `boolean` nullable            | editor sign-off                                             |
| `condition`             | `text` nullable               | one-line condition note                                     |
| `origin`                | `rug_origin` not null         | enum: Persian/Turkish/Caucasian/Indian/Tibetan/Moroccan/Scandinavian/Contemporary/Unspecified |
| `region`                | `text` nullable               | `Tabriz` / `Heriz` / `Konya` / `Karabagh` etc.              |
| `weaver`                | `text` nullable               | named weaver/workshop where known                           |
| `provenance_verified`   | `boolean` not null default false | editor sign-off                                          |
| `provenance_note`       | `text` nullable               | freeform editorial note on provenance                       |
| `text_embedding`        | `vector(1536)` nullable       | pgvector — text embedding for hybrid search                 |
| `image_embedding`       | `vector(512)` nullable        | pgvector — primary image embedding for "more like this"     |
| `embedding_id`          | `text` nullable               | external embedding job handle if applicable                 |
| `updated_at`            | `timestamptz` not null        | ISO updated timestamp                                       |
| `created_at`            | `timestamptz` not null default now() |                                                      |

Indexes:
- `unique (slug)`, `unique (id)`
- `btree (status)`, `btree (collection_slug)`, `btree (origin)`, `btree (technique)`
- `gin (materials)` for array containment
- `ivfflat (text_embedding vector_cosine_ops)` for semantic search
- `ivfflat (image_embedding vector_cosine_ops)` for visual similarity

### `rug_images`

| column        | type                    | notes                                |
| ------------- | ----------------------- | ------------------------------------ |
| `rug_id`      | `text` not null FK      | → `rugs.id` on delete cascade        |
| `position`    | `smallint` not null     | display order, 0-based               |
| `src`         | `text` not null         | CDN URL (Cloudinary/Imgix)           |
| `alt`         | `text` not null         | descriptive alt text (a11y required) |
| `primary`     | `boolean` not null default false | one primary per rug         |
| primary key   | `(rug_id, position)`    |                                      |

### `rug_color_chips`

| column         | type                              | notes                                  |
| -------------- | --------------------------------- | -------------------------------------- |
| `rug_id`       | `text` not null FK                | → `rugs.id` on delete cascade          |
| `position`     | `smallint` not null               | display order                          |
| `name`         | `text` not null                   | editorial name: `madder red`, `indigo` |
| `hex`          | `text` not null                   | `#RRGGBB`                              |
| `weight`       | `color_weight` not null           | enum: `primary` / `secondary` / `accent` |
| primary key    | `(rug_id, position)`              |                                        |

### `rug_design_features`

| column      | type                  | notes                                         |
| ----------- | --------------------- | --------------------------------------------- |
| `rug_id`    | `text` not null FK    | → `rugs.id` on delete cascade                 |
| `position`  | `smallint` not null   |                                               |
| `feature`   | `text` not null       | `all-over Herati`, `ivory field` etc.         |
| primary key | `(rug_id, position)`  |                                               |

### `rug_distinguishing_notes`

| column      | type                  | notes                                         |
| ----------- | --------------------- | --------------------------------------------- |
| `rug_id`    | `text` not null FK    | → `rugs.id` on delete cascade                 |
| `position`  | `smallint` not null   |                                               |
| `note`      | `text` not null       | genuinely uncommon detail worth elevating     |
| primary key | `(rug_id, position)`  |                                               |

### `collections`

| column   | type               | notes                          |
| -------- | ------------------ | ------------------------------ |
| `slug`   | `text` primary key | e.g. `antique-caucasian`       |
| `title`  | `text` not null    | display title                  |
| `blurb`  | `text` nullable    | optional editorial intro       |

## Enums

```
rug_status         = available | on-memo | sold | draft
rug_origin         = Persian | Turkish | Caucasian | Indian | Tibetan | Moroccan
                     | Scandinavian | Contemporary | Unspecified
rug_technique      = Hand-knotted | Hand-woven (flatweave) | Hand-tufted | Hand-loomed
rug_material       = Wool | Silk | Wool & silk | Cotton | Linen | Hemp | Jute
color_weight       = primary | secondary | accent
showroom_location  = chicago | evanston | warehouse
```

## Fields that explicitly DO NOT exist

These are intentional omissions enforced at the schema level. If the upstream Plan A feed ships
them, the ingestion mapper drops them and the editor queue surfaces the diff for awareness.

- `price`, `price_from`, `price_to`, `retail_price`, `msrp`, `estimated_value` — Rule 1.
- `currency` — moot without a price.
- `appraised_value`, `authenticity_guarantee`, `authenticated_by` — Rule 3.
- `discount`, `sale_price`, `clearance_flag` — heritage > discount; clearance is a tab, not a column.
- `user_id`, `cart_id`, `order_id`, `checkout_session` — no consumer accounts, no checkout (v1).

## Mapping to `RugDescription`

The TypeScript `Rug` type composes a nested `description: RugDescription` block. The DB stores its
fields flat on `rugs` plus the child tables, and the read-side mapper reconstitutes the nested
shape so downstream code (`/lib/search`, `/app/rugs`, concierge) sees no difference between the
fixture source and the Postgres source.

```
RugDescription.lead              → rugs.description_lead
RugDescription.details.*         → rugs.size_imperial / size_metric / technique / materials /
                                   pile / knot_density_* / age_* / condition
RugDescription.colorPalette[]    → rug_color_chips (ordered)
RugDescription.designFeatures[]  → rug_design_features (ordered)
RugDescription.distinguishing[]  → rug_distinguishing_notes (ordered)
RugDescription.provenance.*      → rugs.origin / region / weaver / provenance_verified / provenance_note
Rug.images[]                     → rug_images (ordered)
Rug.collection                   → rugs.collection_slug
Rug.status                       → rugs.status
Rug.draft                        → rugs.draft
Rug.updatedAt                    → rugs.updated_at
Rug.embeddingId                  → rugs.embedding_id
```
