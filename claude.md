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

## The five rules (gate every PR; centralized in `/lib/guardrails`)

1. **No prices, ever.** Quoted only. Price intent → quote / visit / wishlist. Automated eval guards this.
2. **No fabricated inventory.** Only real catalog records; always link the real rug page.
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
