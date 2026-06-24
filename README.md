# Oscar Isberian Rugs — AI-native site

A modern, AI-native site for a century-old Chicago rug house. Conversation and visualization are
the front door; a fast browsable catalog is the fallback. Every path converts to a *human*
outcome — book a showroom visit, request a quote, start a wishlist, book a service.

See [CLAUDE.md](./claude.md) for the operating manual (voice, the five rules, repo layout,
definition of done).

## Quick start

```bash
pnpm install
cp .env.example .env.local        # fill ANTHROPIC_API_KEY at minimum
pnpm dev                          # http://localhost:3000

pnpm evals                        # guardrail + voice + FAQ-grounding suites
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm evals` must pass before deploy. The five guardrails (no prices, no fabricated inventory,
no valuations, no risky DIY, visible human exit) are centralized in `lib/guardrails` and exercised
in `evals/guardrails.test.ts`.

## What's here

| Surface | Path | Notes |
|---|---|---|
| Home | `app/page.tsx` | Heritage hero, rotating selection, journal, human exit. |
| Collection | `app/rugs/page.tsx` | Faceted grid (origin, color, size, technique). |
| Rug detail | `app/rugs/[slug]/page.tsx` | Structured `RugDescription`, JSON-LD, quote form, "more like this". |
| Concierge | `app/discover/page.tsx` + `/api/concierge` | Claude tool-use loop, prompt-cached system + tools. |
| Services | `app/services/page.tsx` | Cleaning, restoration. JSON-LD `Service`. |
| Service triage | `app/services/triage/page.tsx` + `/api/triage` | Vision triage, severity band, never DIY. |
| Identify a rug | `app/identify/page.tsx` + `/api/identify` | Vision ID, preliminary by design. |
| Trade | `app/trade/page.tsx` | Designer pricing / memo / first look. |
| Care & FAQ | `app/care/page.tsx`, `app/care/[slug]/page.tsx` | KB-grounded; care-safety routing. |
| Journal | `app/(marketing)/journal/...` | Editorial. |
| Visit | `app/(marketing)/visit/page.tsx` | Showroom info + booking lead. |
| Story | `app/(marketing)/story/page.tsx` | Family history. |

## Repo layout

```
/app                  Next.js routes (App Router)
  /(marketing)        story, journal, visit
  /api                concierge, leads, triage, identify, booking, faq
/components           UI primitives, RugCard, RugDescriptionBlock, ConciergeChat, JSON-LD
/lib
  /ai                 system prompt (voice + five rules), orchestrator, tools, prompt caching
  /search             hybrid stub (semantic + facet)
  /faq                KB retrieval; routes care advice
  /enrich             AI drafting of the structured RugDescription, editor queue
  /guardrails         the five rules + eval helpers
  /catalog            adapter + fixtures (Postgres + pgvector to follow)
  /leads              consent-gated lead sink (HubSpot webhook + email fallback)
  /booking            Cal.com adapter + showroom metadata
  /sanity             read-only client (falls back to fixtures)
  /types              shared shapes
/content              Sanity Studio stub (schemas + config)
/evals                vitest — guardrails, voice, FAQ grounding
/scripts              ingest-catalog stub
```

## The five rules

1. **No prices, ever.** Quoted only. Verified by `evals/guardrails.test.ts`.
2. **No fabricated inventory.** The concierge can only name rugs returned by `search_inventory`.
3. **No valuations or authenticity guarantees.** Identification is always preliminary.
4. **No risky DIY on valuable pieces.** Antique/silk/natural-dye routes to professional handling.
5. **Always a visible human exit.** Phone (Chicago 312-467-1212 / Evanston 847-475-0000) + book a visit.

## AI orchestration

`/lib/ai/orchestrator.ts` drives a Claude (`claude-sonnet-4-6`) tool-use loop:

- System prompt and tool definitions are marked `cache_control: ephemeral` to maximize prompt-cache
  hits across turns and across requests.
- Tools: `search_inventory`, `answer_faq`, `find_similar`, `book_appointment`, `create_lead`.
- After each turn, assistant text is run through `scanAssistantText` (price, valuation, DIY) and
  any cited rug ids are checked against the retrieved set. Violations trigger a human hand-off
  rather than a silent rewrite.
- Vision (triage + identify) uses the same client with the dedicated system prompts in
  `/lib/ai/prompts/{triage,identify}.ts`.

## Catalog and CMS

Until the Postgres + pgvector wiring lands, the catalog is served from `lib/catalog/fixtures.ts`
(20 hand-authored records with the full structured `RugDescription`). Same for the FAQ + care KB
(`lib/faq/kb.ts`) and journal entries (`lib/journal`).

When you provision Sanity, set the env vars from `.env.example` and the read path in
`lib/sanity/client.ts` switches on. Schemas are stubbed in `content/schemas/*`.

## Performance and accessibility

- LCP < 2.5s, CLS < 0.1, INP < 200ms budget. Hero uses `next/image` with `priority`.
- WCAG 2.2 AA: skip-to-content link, visible focus rings, descriptive alt text, reduced-motion
  respected, semantic landmarks.
- Concierge is opt-in; doesn't block initial paint.

## Things deliberately NOT here (v1)

- Prices, public price fields, "from $..." anywhere.
- Cart / checkout / payments / consumer accounts (wishlist is via email).
- Phase 2 (room visualizer) and Phase 3 (trade portal/copilot).
- Auto-publishing of AI-drafted rug copy. Editors verify before publish.
