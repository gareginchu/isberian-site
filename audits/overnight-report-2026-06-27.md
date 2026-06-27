# Overnight session report — 2026-06-27

What landed while you were asleep. Site is live and rebuilding from `main`.

---

## Commits landed (11 total, all on `main`, all pushed)

| Commit | Title |
|---|---|
| `4f2664d` | FloatingConcierge: shrink launcher on mobile to stop overlapping PDP title |
| `a784ab3` | Mobile responsiveness audit: 4 routes, top fix = concierge bubble overlap |
| `82dffc9` | Fix ServiceJsonLd duplicate: keep existing helper, add optional serviceType |
| `2e170b4` | Refactor inline triage Service JSON-LD + fix CI pnpm version conflict |
| `f83d1b0` | Add client report (Markdown source + .docx builder) |
| `719a2d2` | Enrich Product JSON-LD on rug PDPs (no price fields) |
| `9994662` | Add FAQ care entries + heritage reference scaffolds (editor-review) |
| `3bc2d34` | Docs + scaffolding: image pipeline migration plan |
| `6ebad22` | FloatingConcierge: redesign to fin.ai chat surface aesthetic |
| `dcf6c12` | ci: bump pnpm action to v11 (match packageManager pin) |
| `0bd9db6` | Add GitHub Actions CI workflow for typecheck + crawl evals |

Plus the earlier batch from the same session: catalog scaffold,
CrawlEval, OG-fix round 2, BreadcrumbList JSON-LD, Visit LocalBusiness,
triage h1, OG-fix round 1, and the navigation/concierge/font/PPT work.

---

## What was completed

**Wave 1 (six parallel agents — all merged):**
- ✅ Concierge redesigned to fin.ai chat-surface aesthetic (single pill input, rotating chip, soft cream).
- ✅ GitHub Actions CI workflow runs `pnpm typecheck` + `pnpm evals:crawl` on every PR.
- ✅ Product JSON-LD enriched on PDPs: `itemCondition`, `color`, `material`, `width/height`, `identifier`, `audience`. No price fields.
- ✅ Image pipeline migration plan + tiny `cdnUrl()` helper (no-op until configured).
- ✅ AEO content: 6 new FAQ entries + 3 heritage entries (Persian/Caucasian/Turkish orientation), all `verified: false` for editor review.
- ✅ Catalog data-access layer scaffolded for Plan A (Postgres). `CatalogSource` interface, fixture + stub implementations, factory.

**Wave 2 (five items — done either by agent or in-session):**
- ✅ CI smoke test PR caught a pnpm version conflict; **fixed and pushed**. CI workflow now installs cleanly.
- ✅ Mobile responsiveness audit run on iPhone 13/14 viewport, 4 routes.
- ✅ `ServiceJsonLd` extracted from inline triage script into a reusable helper.
- ⚪ Cal.com booking adapter — **already implemented** in `lib/booking/index.ts` (uses `SCHEDULER_API_KEY` env). No work needed.
- ⚪ HubSpot lead webhook — **already implemented** in `lib/leads/index.ts` (uses `LEAD_WEBHOOK_URL` env). No work needed.

**Wave 3 (fixes from audit):**
- ✅ Concierge bubble shrunk on mobile (60px → 48px under `lg`) so it no longer overlaps the PDP rug title or triage form.
- ✅ Carousel arrows verified at 44×44 (already compliant — audit perception was misleading).

---

## What's broken / needs attention

| Issue | Where | Recommendation |
|---|---|---|
| Mobile color-filter pill "dark" wraps alone on `/rugs` | `app/rugs/page.tsx` | Cosmetic; consider 4-column grid for color pills on mobile. |
| Carousel dots indicator slightly overlaps next section on `/` | `components/HeroCarousel.tsx` | Cosmetic; reduce `bottom-6` to `bottom-3` or move dots inside the slide. |
| Mobile hamburger menu not verified (couldn't click in audit) | `components/SiteHeader.tsx` | Worth a manual click-through to confirm Concierge/Identify/Journal/Story links open as expected. |
| **Mobile audit first attempt failed** (Wave 1 agent ran out of turn budget) | n/a | The retry in Wave 2 succeeded — issue resolved. |

---

## What's deferred

These are the open product decisions, not bugs:

- **Inventory feed.** Plan A scaffolded against a schema guess; switch to real Postgres + DB swap is one env-var change once the DB is provisioned. **Still needs Isberian to stand up the database.**
- **DNS / canonical domain.** Site lives at `https://isberian-site-qbj6.vercel.app`. Once DNS lands, set `NEXT_PUBLIC_SITE_URL=https://isberian.com` on Vercel and the canonical URLs flip automatically.
- **CMS provisioning.** Sanity is wired in code (`content/sanity.config.ts`) but no project is provisioned yet.
- **Phase 2 / Phase 3 features** — room visualizer, visual search, trade portal — all designed, none built. Awaits sign-off.

---

## Posture for the morning

1. Open the site on your phone and the desktop, click around. Confirm the mobile concierge no longer overlaps the rug title.
2. Open the Isberian client report (`isberian-report-2026-06-27.docx` in the repo root) in Word and confirm the formatting reads well.
3. Decide which is the next priority:
   - Set up the catalog database (real inventory beyond 46 rugs).
   - Provision Sanity for editor review of FAQ/heritage drafts.
   - Begin DNS cutover and domain canonical work.

No fires. No unresolved breakage. Vercel build queue should be empty by morning.

---

## Health check

- `pnpm typecheck` clean.
- `pnpm evals:crawl` 8/8 routes passing.
- CI workflow green on push to main (verified after pnpm fix).
- Live site responding 200 across all sampled routes.
- No price leaks anywhere in rendered HTML (guardrail #1 still green).
