# Image pipeline migration plan

> Status: planning + scaffolding. No components are wired to a CDN yet.
> Owner: web. Reviewers: catalog, design.

This doc proposes whether (and how) to move rug, hero, and logo imagery off the
Next.js `/public/` directory onto a dedicated image CDN. CLAUDE.md lists
Cloudinary/Imgix in the tech stack; in practice we currently ship `next/image`
against local files and let Vercel's built-in optimizer handle transforms.

## 1. What we have today

All imagery is served from the Next.js `public/` tree and rendered via
`next/image`:

- **Hero carousel** — `public/hero/home-1.jpg` ... `home-8.jpg` (1680x1000),
  referenced as `/hero/home-N.jpg` from `app/page.tsx`.
- **Rug catalog** — `public/rugs/<inventory-id>.jpg` (54 files at the time of
  writing). Path is produced in `lib/catalog/fixtures.ts` via
  `localImage = (id) => `/rugs/${id}.jpg``.
- **Brand marks** — `public/logo.png` and `public/logo-white.png`, referenced
  directly from `components/SiteHeader.tsx` and `components/SiteFooter.tsx`.

Transforms today come from Vercel's built-in image optimizer (configured in
`next.config.mjs` with `formats: ["image/avif", "image/webp"]` and an explicit
`deviceSizes` list). Origin bytes are the originals in `/public/`; the optimizer
produces resized AVIF/WebP variants on demand and caches them on Vercel's CDN.

There is a `cloudinaryLoader` in `lib/cloudinary.ts` that takes
`ImageLoaderProps` and rewrites the URL with `f_auto,c_fill,w_,q_` transforms,
plus a populated `IMAGE_CDN_URL` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in
`.env.example`. **It is not imported anywhere** — it's scaffolding from an
earlier pass and was never wired into a `<Image loader={...}>` prop or
`next.config.mjs`'s `images.loader`. No actual Cloudinary account is in use.

## 2. Trade-offs

Three options on the table. The honest framing: for a 50-rug catalog of static
JPEGs that change rarely, a dedicated CDN is mostly future-proofing — the value
shows up when we start doing dynamic work (hotspots, crops, color extraction).

### Option A: Stay on Vercel's built-in image optimizer

What it is: `next/image` with files in `/public/` and `next.config.mjs`
controlling `formats`, `deviceSizes`, and `remotePatterns`.

- Pros
  - **Already working.** Zero migration cost, zero new infra.
  - Format negotiation (AVIF/WebP) is automatic and respects `Accept`.
  - Resized variants are cached on Vercel's CDN with strong cache headers.
  - No extra credentials, no extra bills, no extra service to go down.
  - Git contains the canonical bytes — the catalog is fully reproducible from
    `pnpm catalog:ingest` + the repo.
- Cons
  - **Only `w_` / `q_` / format.** No crops, no fills, no rotations, no overlays,
    no color extraction, no smart focal point.
  - **Repo weight.** Originals live in git; 54 rugs at high res is manageable,
    a 5,000-rug catalog is not.
  - **Vercel image-optimization usage** is metered (transformations + source
    images). A larger catalog will hit the included tier.
  - Editors cannot replace an image without a code deploy.

### Option B: Cloudinary

What it is: managed image+video CDN with a rich URL transformation grammar
(`c_fill,g_auto,w_800,h_600,q_auto,f_auto,...`), an admin UI, AI add-ons (color
palette, background removal, focal-point detection), and structured metadata.

- Pros
  - **Dynamic crops and gravity.** `c_fill,g_auto` is meaningful for rug grid
    cards where the right crop matters (medallion vs. border framing).
  - **Color palette extraction** out-of-the-box. Aligns with the
    `colorPalette` field on `RugDescription` — we can confirm AI-drafted swatches
    against Cloudinary's analysis instead of just embeddings.
  - **Hotspot / focal-point management** without a custom CMS field.
  - **Editor upload UI.** Replacing a rug photo no longer requires a deploy.
  - `next/image` integration via `images.loader: "custom"` + a small loader
    (we already have a stub in `lib/cloudinary.ts`).
  - On-the-fly `f_auto,q_auto` is best-in-class.
  - Free tier (25 monthly credits) is plenty for the v1 catalog.
- Cons
  - **Another vendor**, another credential, another point of failure.
  - **Bytes leave the repo.** We need a re-uploadable backup strategy and a
    naming convention (`isberian/rugs/<id>` public IDs).
  - Pricing scales with transformations + bandwidth; a viral moment is
    metered.
  - The transformation grammar is theirs; if we leave Cloudinary, every URL
    has to be rewritten.

### Option C: Imgix

What it is: image-CDN-only, no upload UI by default — you point Imgix at an
origin (S3, GCS, or HTTPS) and it transforms on the fly via query params
(`?w=800&fit=crop&auto=format`).

- Pros
  - **Pure CDN, no lock-in of the bytes.** Origin stays in our control (S3 or
    even Vercel `/public/` over HTTPS).
  - URL grammar is plain query strings — drops in behind `next/image`
    trivially.
  - Excellent perf, fast purge.
  - Cleaner separation of concerns: storage is storage, CDN is CDN.
- Cons
  - **No upload UI.** Editors need a separate flow (we'd build it, or pair
    with Sanity asset uploads).
  - **No AI add-ons** comparable to Cloudinary's palette / background removal.
    We'd reimplement palette extraction in our own pipeline (we partly do this
    already via `lib/enrich`).
  - Pricing per master image + transformations — fine at v1 scale, watch as
    the catalog grows.
  - Auto-crop (`fit=crop&crop=entropy`) exists but is less sophisticated than
    Cloudinary's `g_auto`.

## 3. Recommendation

**Stay on Vercel's built-in optimizer for v1.** Move to **Cloudinary** when one
of these conditions is met:

1. The catalog grows past ~500 rugs and originals become uncomfortable in git.
2. Editors need to replace rug photography without a code deploy.
3. We start building features that need dynamic crops, focal points, or color
   extraction — specifically: grid-card auto-crop respecting medallion
   placement, swatch confirmation for the `RugDescription.colorPalette` field,
   or the room visualizer (Phase 2).

Reasoning specific to this codebase:

- The rug-house use case is **editorially curated, slow-moving photography**,
  not user-generated content. Cloudinary's "upload + transform" loop is most
  valuable when uploads are frequent; ours aren't.
- We **already do AI work on every rug image** (vision classify, embeddings,
  enrich). Color palette + focal-point detection is plausible to do once at
  ingest time and store on the record — we don't need a CDN doing it per
  request.
- `next/image` with `formats: ["image/avif", "image/webp"]` already covers the
  Core Web Vitals targets in CLAUDE.md (LCP < 2.5s, CLS < 0.1).
- Cloudinary is the right second step **when** the second condition above
  triggers; Imgix is the right step if storage and CDN should be decoupled and
  we want to keep imagery in our own S3 bucket. Imgix is a worse fit for the
  editorial-replace use case because it has no upload UI.

Removing the unused `lib/cloudinary.ts` is **out of scope for this PR** — it's
still the seed for the migration. Leave it, add a comment if it confuses
people.

## 4. Migration steps (when we trigger)

These are the steps to follow when one of the conditions above is met. None of
this happens in this PR.

1. **Provision Cloudinary** account (`isberian` cloud name; product folder
   `isberian/`).
2. **Upload** existing `public/rugs/<id>.jpg` to Cloudinary with public IDs
   `isberian/rugs/<id>`. Use the Admin API or a one-shot script in
   `scripts/upload-to-cloudinary.ts`. Keep `/public/rugs/` in git as the
   authoritative backup until we have an export plan.
3. **Env** — `IMAGE_CDN_URL` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` are
   already in `.env.example`. Populate the real values in Vercel's project
   settings (preview + production).
4. **Helper** — `lib/images/cdn.ts` (this PR) exposes `cdnUrl(localPath, opts)`.
   It's a no-op when `IMAGE_CDN_URL` is unset, and switches to CDN URLs once
   the env var is populated. This lets us cut over **per call-site** rather
   than all at once.
5. **next.config.mjs** — already lists `res.cloudinary.com` under
   `remotePatterns`, so no change needed for the Cloudinary host. If we use
   `images.loader: "custom"` with the existing `cloudinaryLoader`, we also need
   `images.loaderFile` pointing at it. Defer that decision until the cutover;
   the `cdnUrl` helper avoids the global loader switch.
6. **Rollout order** — gradual, smallest-blast-radius first:
   1. **Rugs** (`/rugs/<id>.jpg`) — single point of reference in
      `lib/catalog/fixtures.ts` (and eventually the Postgres catalog source).
      Wrap `localImage()` with `cdnUrl()`. Highest payoff: 54+ files, growing.
   2. **Hero carousel** (`/hero/home-N.jpg`) — eight files referenced inline
      in `app/page.tsx`. Wrap each `src` in `cdnUrl()`. LCP-sensitive — verify
      preload + `priority` still kick in.
   3. **Logos** (`/logo.png`, `/logo-white.png`) — two tiny PNGs in
      `SiteHeader.tsx` / `SiteFooter.tsx`. Wrap last; payoff is marginal but it
      consolidates the pipeline.
7. **Verification per step**
   - `pnpm build` succeeds.
   - `pnpm evals` green (no guardrail touches images, but regression sanity).
   - Lighthouse LCP unchanged on `/` and `/rugs/[slug]`.
   - `next/image` still emits AVIF on supporting browsers (DevTools network
     tab → `accept: image/avif` request, Cloudinary returns
     `content-type: image/avif`).
8. **Cleanup** — once all three call-sites are on `cdnUrl`, decide whether to
   delete `public/rugs/` and `public/hero/` from git. Keep them around for at
   least one release after cutover (rollback path).

## 5. Out of scope

- Room visualizer (Phase 2) compositing.
- Editor upload UI / Sanity asset pairing.
- Video assets.
- Service-photo and rug-ID user uploads — those are session-scoped, stored in
  `lib/leads`, and never make it to a public CDN.
