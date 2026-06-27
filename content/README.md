# Content (Sanity Studio)

This directory holds the schemas and config for the Sanity Studio. The Studio
itself is not bundled in the main install — it runs locally via the Sanity
CLI. The site reads via `lib/sanity/client.ts`; until the project is
provisioned, catalog / FAQ / care / journal adapters fall back to fixtures so
the entire site is exercisable without Sanity.

## Document types

- **`rug`** — the catalog records. AI-drafted entries land here as
  `reviewStatus: "needs-review"`. Editors verify origin / age / palette /
  features, then flip to `"approved"`.
- **`rugDescription`** — embedded object on each `rug`, holds the structured
  lead / details / palette / features / provenance.
- **`faqEntry`** — care + service KB.
- **`careGuide`** — long-form care articles.
- **`journalEntry`** — editorial.
- **`collection`** — antique Persian / Caucasian / etc. groupings.

## Editor review queue for the 20 AI-drafted rugs

We have 20 rug entries that Claude vision drafted from upstream catalog
photos. Each has `provenance.verified: false` and `age.verified: false` so
the live UI flags them as preliminary. Setup steps to get them into Sanity
for an editor:

### 1. Create the Sanity project (one-time, ~5 min)

1. Go to https://www.sanity.io/manage and sign in.
2. Click **Create new project**. Name it `oscar-isberian-rugs` (or similar).
3. Dataset: `production`.
4. Copy the **Project ID** from the project dashboard.
5. Go to **Settings → API → Tokens**. Create a token with **Editor** permissions.
   Copy the token value (you won't see it again).

### 2. Add the credentials to `.env.local`

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<your project id>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<the editor token from step 1>
```

### 3. Push the 20 AI-drafted entries to Sanity

From the repo root:

```bash
pnpm tsx scripts/sync-drafts-to-sanity.ts
```

This writes 20 `rug` documents to Sanity with `reviewStatus: "needs-review"`.
Safe to re-run — it uses `createOrReplace` keyed on the catalog rug id.

### 4. Launch the Studio for editor review

From this directory:

```bash
cd content
pnpm dlx sanity@latest dev
```

This boots a local Sanity Studio (browser UI) at http://localhost:3333. The
editor opens each `rug` document with `reviewStatus: "needs-review"`,
verifies fields, edits where needed, then flips `reviewStatus` to
`"approved"` and saves.

### 5. Sync verified data back to the catalog

> **TODO**: `scripts/sync-from-sanity.ts` — reads approved documents from
> Sanity, updates the matching entry in `lib/catalog/fixtures.ts` with
> verified flags = true. Currently the editor's changes live in Sanity only
> until this script lands.

For now, after the editor approves entries in Sanity, manually update the
matching `lib/catalog/new-fixture-seeds.json` records with `verified: true`
and any field corrections — then re-import fixtures.

## Why not mount the Studio in our Next.js app

We could add a `/studio` route via `next-sanity/studio`, but it adds ~50 MB
of dependencies to every deployment. For an MVP with a small editorial team,
running the Studio locally is the leaner choice — same review UX, none of
the bundle weight.
