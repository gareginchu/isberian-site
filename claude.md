# CLAUDE.md — Oscar Isberian Rugs, AI-Native Site (Greenfield MVP)

> Rename to `CLAUDE.md` at the repo root. Operating manual for Claude Code agents on this codebase.
> This is a *new* site, not a patch to the old WordPress one. The business model is unchanged:
> heritage, consultative, **quote-based (no public prices)**, showroom- and trade-driven.

## What we're building

A modern, AI-native site for a century-old Chicago rug house. **Conversation and visualization are
the front door**; a fast browsable catalog is the fallback. Every path converts to a *human*
outcome — book a showroom visit, request a quote, start a wishlist, book a service, or (later) a
trade memo. We never run anonymous checkout and never publish prices.

Primary AI surfaces (v1): concierge discovery, an **FAQ/rug-care knowledge base**, visual "more like
this," services photo triage, rug identification, and AI-enriched catalog copy in a **structured
description schema** + structured data. Room visualizer and trade copilot are later phases — don't
pull them forward without sign-off.

## North star

A buyer asking an AI assistant *"antique Heriz dealer in Chicago"* can be surfaced and routed to
Isberian, and a human can book a showroom visit from any rug page. Crawlability + grounded
conversation + a visible booking path — that's the bar.

## The five rules (gate every PR; centralized in `/lib/guardrails`)

1. **No prices, ever.** Quoted only. Price intent → quote / visit / wishlist. Automated eval guards this.
2. **No fabricated inventory or stats.** Only real catalog records; always link the real rug page.
   No invented numbers either — "98% stain removal," "10,000+ rugs sold" — unless sourced from
   operations.
3. **No valuations or authenticity guarantees.** Rug ID is preliminary → human appraiser.
4. **No risky DIY** on valuable/antique pieces → route to inspection.
5. **Always a visible human exit** — phone (Chicago 312-467-1212 / Evanston 847-475-0000) + book-a-visit.

## Tech stack

- **Next.js (App Router)** + React + TypeScript + Tailwind. SSR/ISR; mobile-first.
- **Images:** Cloudinary/Imgix pipeline; responsive, lazy, modern formats. Imagery is the hero —
  performance budget is strict (LCP < 2.5s, CLS < 0.1, INP < 200ms).
- **CMS:** headless (Sanity or Payload) for editorial/heritage/journal/collections, the structured
  rug-description blocks, and the **FAQ/care knowledge base**.
- **Data:** Postgres + `pgvector` (text *and* image embeddings). Catalog ingested from the existing
  inventory source, normalized into our own model.
- **AI:** Anthropic API (`@anthropic-ai/sdk`), model `claude-sonnet-4-6` for orchestration + vision;
  embeddings for semantic + visual search.
- **Booking:** Cal.com (showroom-aware) behind an adapter. **Leads:** HubSpot webhook + email.
- **Deploy:** Vercel. **Analytics:** privacy-respecting, with lead attribution.
- No payments. No consumer accounts in v1 beyond email-based wishlists.

## Inventory feed — the critical dependency

The catalog data lives upstream (currently served as an AJAX endpoint that the legacy
`isberian.com` loads client-side, which is why crawlers see `Total Results: 0`). Before any
SSR catalog work, resolve **one** of:

- **Plan A (preferred):** a real product feed/API — fields include `id`, `slug`, `title`,
  `origin`, `age/period`, `size`, `material`, `weave/knot`, `color tags`, `style/category`,
  `images[]`, `showroom/location`, `status`. Build a typed client + mapper in `/lib/catalog`.
- **Plan B:** thin ingestion adapter over the current AJAX endpoint. Use only if Plan A is
  blocked. Flag the data-access gap to the client immediately — **this is schedule risk #1**.

Do not hard-code sample catalog data beyond local dev fixtures. The data contract lives in
`/lib/catalog/types.ts` and is the source of truth.

## Imagery policy (MVP)

Reuse existing assets — no new photo shoot gates the MVP.

- **Editorial / hero / category tiles:** reuse files already in the WordPress media library
  (`wp-content/uploads/...`). Re-export through our image pipeline (responsive `srcset`,
  modern formats, strip EXIF). Don't link them hot from upstream.
- **Catalog product photos:** arrive with the inventory feed; PDPs display whatever per-rug
  images already exist. Don't commission new product photography for v1.
- **OG / Twitter images are the rug, never the logo.** Per-rug share images via
  `app/rugs/[slug]/opengraph-image.tsx`. The legacy site shipping the grey logo as the share
  image is a measurable GEO loss — don't replicate it.
- **Alt text on every image,** descriptive not decorative. Required for a11y and AI parsing.
- **Rights check before reuse of partner / designer imagery** (RugStar, Michael Del Piero,
  2to5Design, IIDA, etc.). Confirm Isberian holds reuse rights — flag, don't assume.
- **Hero photography pass is Phase 3.** Color-accurate, consistent photography is a
  prerequisite for the *visualizer and visual search*, not for the catalog or concierge.

## Repository layout

```
/app                  # Next.js routes (see sitemap in the spec)
  /(marketing)        # home, story, journal, visit
  /rugs               # grid + [slug] detail
  /discover           # full-screen concierge
  /services           # services + /triage
  /identify           # rug identification
  /trade              # trade landing (portal is Phase 3)
/components           # UI; gallery, result cards, assistant, forms
/lib
  /ai                 # orchestrator, tools, prompts (single source of voice + rules)
  /search             # hybrid semantic + facet + visual-similarity
  /faq                # FAQ/care KB retrieval (grounded answers; care-safety routing)
  /enrich             # AI drafting of the structured RugDescription (§5), editor-review queue
  /guardrails         # price/inventory/valuation filters + eval harness
  /catalog            # ingestion + normalization + embeddings
  /leads              # CRM/email sink, consent handling
/content              # CMS schema/config (incl. /care guides + faq entries)
/evals                # guardrail + quality suites (CI-gated)
```

## Commands

```bash
pnpm install
pnpm dev
pnpm catalog:ingest      # pull + normalize + embed inventory
pnpm evals               # guardrail + quality (MUST pass before deploy)
pnpm build && pnpm start
pnpm lint && pnpm typecheck
pnpm a11y                # accessibility checks
```

## AI orchestration

One Claude loop with tools; the **system prompt in `/lib/ai/prompts`** is the single source of voice
and the five rules — don't re-encode rules ad hoc elsewhere.

Tools:
- `search_inventory(query, filters)` — hybrid semantic + facet over the catalog (real records only).
- `answer_faq(query)` — retrieval over the curated FAQ/care KB (care, materials, sizing, services,
  logistics, quote process). Returns grounded answers with the source entry; if the matched care
  advice concerns a valuable/antique/silk piece, it routes to professional service, never DIY. Empty
  or low-confidence match → human hand-off, not a guess.
- `find_similar(rug_id)` — visual-similarity via image embeddings (for "more like this").
- `classify_service_photo(images, note)` — vision → issue + severity band (no price), books service.
- `identify_rug(images)` — vision → hedged origin/age/type (preliminary), books appraisal.
- `book_appointment(showroom, slot, contact)` — Chicago/Evanston, real hours.
- `create_lead(type, transcript, photos, contact)` — consent-gated CRM/email.

## Conventions

- **Voice:** a master dealer with a century of family heritage — warm, precise, unhurried, never
  pushy, never falsely certain. Provenance and story over hype. No emoji.
- **Grounding:** any claim about a specific rug comes from a retrieved record. Empty retrieval →
  say so, offer custom or a visit. Never improvise stock, sizes, or origins.
- **Catalog truth:** the normalized DB is the source; never expose raw upstream quirks; **never** add
  a public price field (`status` may be available/on-memo/sold, but no dollar amounts).
- **Structured rug descriptions:** every rug page renders the structured `RugDescription` block
  (`lead`, `details`, `colorPalette`, `designFeatures`, `distinguishing`, `provenance`) — not a free
  prose blob. AI drafts each field from attributes + images; an **editor verifies before publish**,
  and any unverified origin/age/knot-count/provenance claim stays in draft and is visibly flagged.
  Write specific and restrained, never the empty-superlative register ("Exquisite … Masterpiece …");
  specificity sells this category, adjectives don't. `colorPalette`/`details` are also emitted as
  facets so the grid and concierge filter consistently.
- **FAQ/care answers are retrieval-grounded.** Never improvise care or material advice; pull from the
  KB and cite the entry. For valuable/antique/silk pieces, route to professional service (guardrail 4).
- **Structured data:** every rug + service page emits correct JSON-LD; the structured description and
  care guides are the AEO substrate — keep them accurate and crawlable.
- **A11y:** WCAG 2.2 AA everywhere (grid, assistant, forms, modals). Alt text is descriptive, not
  decorative.
- **Privacy:** consent line before PII; defined retention for transcripts/photos; policy linked.
- **Perf budget:** respect Core Web Vitals targets; defer/stream the assistant; don't block LCP.
- **Failure mode:** low confidence or tool error → human hand-off, never a guess.

## Environment

```
ANTHROPIC_API_KEY=
DATABASE_URL=                # Postgres + pgvector
CATALOG_SOURCE_URL=          # upstream inventory (read for ingest)
IMAGE_CDN_URL=               # Cloudinary/Imgix
CMS_PROJECT_ID= / CMS_TOKEN=
SCHEDULER_API_KEY=           # Cal.com
LEAD_WEBHOOK_URL=            # HubSpot
LEAD_EMAIL_TO=info@isberian.com
SESSION_RETENTION_DAYS=30
```

## Definition of done (every feature)

- [ ] `pnpm evals` green (price / fabricated-inventory / valuation guardrails).
- [ ] **Crawlable:** `curl` of any catalog/rug route (JS off) returns the primary content
      and valid JSON-LD in the initial HTML. If a crawler can't see the rug, it's a bug.
- [ ] Core Web Vitals within budget on affected routes.
- [ ] WCAG 2.2 AA pass (`pnpm a11y`).
- [ ] Correct JSON-LD where applicable; AI copy human-reviewed.
- [ ] Human exit visible; leads land with transcript/photos/consent.

## Do NOT

- Do not add prices, "from $…", or "estimated value" anywhere.
- Do not build checkout/cart/payments or consumer accounts (wishlist via email only in v1).
- Do not ship Phase 2/3 features (room visualizer, trade portal/copilot) without sign-off.
- Do not publish AI-generated rug copy without human review.
- Do not let the concierge answer care/material/FAQ questions from model memory — KB-grounded only.
- Do not suggest DIY cleaning/repair for valuable, antique, or silk rugs — route to a specialist.
- Do not exceed the performance budget for the sake of a heavier hero animation.
- **Heritage > discount.** Do not use red "sale" styling as a primary accent or CTA color.
  Clearance is a tab, never the brand's opening line.
- Do not render primary catalog content client-side. Server-rendered HTML or it's a bug.
- Do not ship the logo as an OG / Twitter share image — every rug page emits its own.

## Suggested agents (parallelizable)

Use these as the orchestration spine when splitting work across Claude Code runs:

- **catalog-ssr** — feed client, mappers, SSR/ISR for `/rugs` listing + PDP. Critical path.
- **seo-geo** — JSON-LD, sitemap, metadata helpers, per-rug OG images, GEO content scaffolds.
- **concierge** — RAG store, system prompt, guardrails, hand-off, `/api/concierge` route.
- **funnel** — booking forms, upload signer, staff notifications, showroom pages.
- **design-system** — tokens, hero, typography, polish fixes, accessibility.
- **qa** — crawlability suite, CWV budgets, a11y audit, eval harness.

`catalog-ssr` + `seo-geo` are on the critical path and unblock the rest. `concierge`,
`funnel`, and `design-system` run in parallel once the data contract is locked.
