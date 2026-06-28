/**
 * One-shot migration: push every seed in lib/catalog/new-fixture-seeds.json
 * into Sanity as a `rug` document. Idempotent via createOrReplace keyed on
 * _id = `rug.<seedId>`. Re-running is safe and overwrites with the latest
 * values from the file.
 *
 *   pnpm tsx scripts/migrate-seeds-to-sanity.ts
 *
 * Requires:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET (default: production)
 *   SANITY_API_TOKEN  (Editor permissions, from sanity.io/manage → API → Tokens)
 *
 * Note: collections are stored as a plain string field on the rug (e.g.
 * "antique-persian") rather than a Sanity reference. Keeps the migration
 * trivial; we can convert to references later by seeding collection
 * documents and running a one-shot patch.
 */
import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_TOKEN;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

type Seed = {
  id: number;
  title: string;
  size: string;
  condition: string;
  origin: string;
  region?: string;
  age: string;
  technique: string;
  materials: string[];
  pile: string;
  lead: string;
  enrichment: {
    colorPalette: { name: string; hex: string; weight: "primary" | "secondary" | "accent" }[];
    designFeatures: string[];
    distinguishing: string[];
  };
  collection: string;
  draft: boolean;
  model3dGlbUrl?: string;
  model3dUsdzUrl?: string;
  suggestedRoomUrl?: string;
  lifestyle?: { slug: string; label: string; src: string }[];
};

function slugFor(seed: Seed): string {
  const base = seed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base}-${seed.id}`;
}

function buildDoc(seed: Seed) {
  return {
    _id: `rug.${seed.id}`,
    _type: "rug",
    title: seed.title,
    slug: { _type: "slug", current: slugFor(seed) },
    status: "available",
    collection: seed.collection, // plain string for now
    description: {
      _type: "rugDescription",
      lead: seed.lead,
      details: {
        sizeImperial: seed.size,
        technique: seed.technique,
        materials: seed.materials,
        pile: seed.pile,
        condition: seed.condition,
        age: { circa: seed.age, verified: false },
      },
      colorPalette: seed.enrichment.colorPalette,
      designFeatures: seed.enrichment.designFeatures,
      distinguishing: seed.enrichment.distinguishing,
      provenance: {
        origin: seed.origin,
        ...(seed.region ? { region: seed.region } : {}),
        verified: false,
      },
    },
    images: [
      {
        _key: "primary",
        src: `/rugs/${seed.id}.jpg`,
        alt: `${seed.title}, ${seed.size}.`,
        primary: true,
      },
    ],
    draft: seed.draft,
    reviewStatus: "approved",
    reviewNotes: "Migrated from new-fixture-seeds.json.",
    ...(seed.model3dGlbUrl ? { model3dGlbUrl: seed.model3dGlbUrl } : {}),
    ...(seed.model3dUsdzUrl ? { model3dUsdzUrl: seed.model3dUsdzUrl } : {}),
    ...(seed.suggestedRoomUrl ? { suggestedRoomUrl: seed.suggestedRoomUrl } : {}),
    ...(seed.lifestyle && seed.lifestyle.length > 0 ? { lifestyle: seed.lifestyle } : {}),
  };
}

async function main() {
  if (!projectId || !token) {
    console.error(
      "Missing env vars. Set in .env.local:\n" +
        "  NEXT_PUBLIC_SANITY_PROJECT_ID=<your sanity project id>\n" +
        "  NEXT_PUBLIC_SANITY_DATASET=production\n" +
        "  SANITY_API_TOKEN=<editor write token>",
    );
    process.exit(1);
  }

  const client = createClient({
    projectId, dataset, apiVersion: "2024-12-01", token, useCdn: false,
  });

  const seedsPath = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
  const seeds: Seed[] = JSON.parse(await readFile(seedsPath, "utf8"));
  console.log(`Migrating ${seeds.length} rugs → Sanity project ${projectId} / ${dataset}\n`);

  let ok = 0;
  let failed = 0;
  for (const seed of seeds) {
    try {
      await client.createOrReplace(buildDoc(seed));
      console.log(`  ✓ ${seed.id}: ${seed.title.slice(0, 60)}`);
      ok++;
    } catch (e) {
      console.warn(`  ✗ ${seed.id}: ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }
  console.log(`\nDone. ${ok}/${seeds.length} migrated · ${failed} failed.`);
  console.log(`Studio: https://www.sanity.io/manage/personal/project/${projectId}`);
  console.log(`Or run \`pnpm dlx sanity dev\` from content/ for the local Studio.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
