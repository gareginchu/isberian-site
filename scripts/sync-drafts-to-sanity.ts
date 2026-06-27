/**
 * Push the 20 AI-drafted catalog entries to Sanity as `rug` documents with
 * reviewStatus="needs-review". An editor opens each in Sanity Studio, edits
 * fields, flips reviewStatus to "approved", then `sync-from-sanity.ts`
 * (follow-up script) copies the verified data back into lib/catalog/fixtures.ts.
 *
 * Requires (set in .env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID = <your Sanity project id>
 *   NEXT_PUBLIC_SANITY_DATASET    = production   (or whatever you named it)
 *   SANITY_API_TOKEN              = a write-token from Sanity → Settings → API
 *
 * Then:
 *   pnpm tsx scripts/sync-drafts-to-sanity.ts
 *
 * Safe to re-run — uses createOrReplace by `_id` keyed on the catalog rug id.
 */

import { createClient } from "@sanity/client";
import { fixtureRugs } from "@/lib/catalog/fixtures";
import { config } from "dotenv";
config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_TOKEN;

async function main() {
  if (!projectId || !token) {
    console.error(
      "Missing env vars. To run this script, add to .env.local:\n" +
        "  NEXT_PUBLIC_SANITY_PROJECT_ID=<your sanity project id>\n" +
        "  NEXT_PUBLIC_SANITY_DATASET=production\n" +
        "  SANITY_API_TOKEN=<editor write token>\n\n" +
        "Get them from https://www.sanity.io/manage after creating the project.",
    );
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-12-01",
    token,
    useCdn: false,
  });

  // Pull the entries that came from the AI drafter — they're the ones with
  // provenance.verified === false. Existing 46 entries are editor-verified.
  const needsReview = fixtureRugs.filter((r) => !r.description.provenance.verified);
  console.log(`Pushing ${needsReview.length} AI-drafted rugs to Sanity (project ${projectId}) …`);

  let written = 0;
  for (const rug of needsReview) {
    const doc = {
      _id: `rug.${rug.id}`,
      _type: "rug",
      title: rug.title,
      slug: { _type: "slug", current: rug.slug },
      status: rug.status,
      // collection is a reference; pre-create collection docs in Sanity first
      // if you want this populated. For now we leave it blank in the synced
      // draft so editors can set it.
      description: rug.description,
      images: rug.images,
      draft: rug.draft,
      reviewStatus: "needs-review",
      reviewNotes: "AI-drafted via Claude vision. Verify origin, age, color palette, and motif list before approving.",
    };
    try {
      await client.createOrReplace(doc);
      console.log(`  ✓ ${rug.id}: ${rug.title}`);
      written++;
    } catch (err) {
      console.warn(`  ✗ ${rug.id}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\nDone. ${written}/${needsReview.length} synced to Sanity.`);
  console.log("Editor URL: https://www.sanity.io/manage/personal/project/" + projectId);
  console.log("Or run `pnpm dlx sanity dev` from content/ for the local Studio.");
}

main().catch((err) => { console.error(err); process.exit(1); });
