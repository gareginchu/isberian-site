/**
 * Stub: pull upstream inventory, normalize, embed, write to Postgres + pgvector.
 *
 * For v1 the catalog is fixture-served. This script outlines the contract so the wiring up to
 * upstream + embeddings is a single follow-up commit.
 *
 *   pnpm catalog:ingest --dry
 *
 * Steps when implemented:
 *   1. Fetch upstream rows from CATALOG_SOURCE_URL.
 *   2. Normalize to our Rug shape (no public prices; status mapped to available/on-memo/sold).
 *   3. Generate text + image embeddings via Anthropic-compatible provider; store vectors.
 *   4. Upsert to Postgres; mark draft until an editor verifies origin/age/knot-count claims.
 *   5. Enqueue AI enrichment of the structured RugDescription for editor review.
 */

const DRY = process.argv.includes("--dry");

async function main() {
  const source = process.env.CATALOG_SOURCE_URL;
  if (!source) {
    console.log("[ingest] CATALOG_SOURCE_URL not set; nothing to do.");
    return;
  }
  console.log(`[ingest] would fetch from ${source} (dry=${DRY})`);
  // TODO: fetch, normalize, embed, upsert.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
