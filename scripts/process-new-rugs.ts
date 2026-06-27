/**
 * One-pass pipeline for every newly-fetched rug in public/rugs/:
 *
 *   1. Audit  — pass/fail on (a) top-down catalog shot, (b) no
 *              non-rug objects, (c) minimum resolution. PERMISSIVE — only
 *              fails on hard problems (visible hands, mannequins, label
 *              cards, severely off-axis), not on woven dates or minor
 *              perspective wobble.
 *   2. Type   — classifies into a rug-type bucket so we can balance the
 *              final catalog for diversity.
 *   3. Draft  — generates the full Seed-shaped fixture entry (title,
 *              size, lead, palette, design features, distinguishing,
 *              provenance) so it lands in lib/catalog/new-fixture-seeds.json.
 *
 * Failures get added to a delete list. After this script, run
 * scripts/finalize-catalog.ts to:
 *   - Delete the failed images
 *   - Write the new fixture seeds
 *   - Re-run CLIP embeddings
 *
 *   pnpm tsx scripts/process-new-rugs.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const MODEL = "claude-sonnet-4-6";
const CONCURRENCY = 5;
const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const KEEP_IDS = new Set([
  // The 20 we've already AI-drafted; skip — they're in new-fixture-seeds.json already.
  "89134", "89111", "89090", "89082", "89068", "88889", "88885", "88859",
  "88857", "88855", "88853", "88851", "88849", "88847", "88845", "88843",
  "88841", "88839", "88837", "88834",
]);

const OUT_SEEDS = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
const OUT_AUDIT = path.resolve(process.cwd(), "lib", "catalog", "rug-audit.json");

type SeedDraft = {
  id: number;
  title: string;
  size: string;
  condition: "Excellent." | "Very good." | "Good." | "Some restoration noted.";
  origin: "Persian" | "Turkish" | "Caucasian" | "Contemporary" | "Moroccan" | "Indian" | "Tibetan" | "Scandinavian";
  region?: string;
  age?: string;
  technique?: "Hand-knotted" | "Hand-woven (flatweave)";
  materials?: ("Wool" | "Silk" | "Wool & silk" | "Cotton")[];
  pile?: "Low" | "Medium" | "High";
  lead: string;
  enrichment: {
    colorPalette: { name: string; hex: string; weight: "primary" | "secondary" | "accent" }[];
    designFeatures: string[];
    distinguishing: string[];
  };
  collection?: string;
};

type Result = {
  id: string;
  audit: { pass: boolean; reason: string };
  rugType?: string;
  draft?: Omit<SeedDraft, "id">;
};

const PROMPT = `You are looking at a single rug photograph from a heritage rug catalog. Do THREE things in one JSON output:

1) AUDIT for visualizer-readiness. PERMISSIVE — only fail on HARD problems:
   - Visible non-rug objects in frame (hands, mannequins, label cards, watermarks)
   - Severely off-axis perspective (rug is clearly hung on a wall and shot at an angle)
   - Multiple rugs in one image
   - Cut-off / partial rug (less than 80% visible)
   - Very low resolution / blurry
   DO NOT FAIL for:
   - Woven dates or inscriptions (those are part of the rug design)
   - Slight perspective wobble
   - Natural shag pile flow
   - Minor wrinkles or folds

2) TYPE — categorize by rug family. Use ONE of:
   antique-persian | antique-caucasian | antique-turkish | antique-european |
   moroccan | indian-agra | tibetan | scandinavian | contemporary-modern |
   contemporary-tribal | silk | flatweave-kilim | flatweave-soumak | runner-only

3) DRAFT a fixture entry in the house voice: master dealer, century of family
   practice. Warm, precise, unhurried. Specific over superlative. No emoji.
   "Exquisite/masterpiece/stunning" forbidden. Provenance over hype.

Output VALID JSON only (no prose, no markdown fence):
{
  "pass": true|false,
  "reason": "<one short sentence>",
  "rugType": "<one of the type categories above, omit if pass=false>",
  "draft": {
    "title": "<6-10 words, descriptive>",
    "size": "<best-guess imperial like \\"5'0\\" × 8'0\\"\\" inferred from aspect ratio>",
    "condition": "Excellent.|Very good.|Good.|Some restoration noted.",
    "origin": "Persian|Turkish|Caucasian|Contemporary|Moroccan|Indian|Tibetan|Scandinavian",
    "region": "<weaving region if visible / inferable, omit if uncertain>",
    "age": "<e.g. c. 1900, Mid-20th century, Contemporary>",
    "technique": "Hand-knotted|Hand-woven (flatweave)",
    "materials": ["Wool"] etc.,
    "pile": "Low|Medium|High",
    "lead": "<one paragraph, max 240 chars>",
    "enrichment": {
      "colorPalette": [{"name":"<color>","hex":"#RRGGBB","weight":"primary|secondary|accent"}],
      "designFeatures": [3-6 noun phrases],
      "distinguishing": [0-3 short notes]
    },
    "collection": "antique-persian|antique-turkish|antique-caucasian|contemporary|custom"
  }
}

If pass=false, omit rugType and draft. ONLY return the JSON object.`;

async function processOne(client: Anthropic, id: string): Promise<Result> {
  const imgPath = path.join(RUGS_DIR, `${id}.jpg`);
  try {
    const buf = await readFile(imgPath);
    const b64 = buf.toString("base64");
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1800,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });
    const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const parsed = JSON.parse(cleaned);
    return {
      id,
      audit: { pass: parsed.pass === true, reason: parsed.reason ?? "" },
      rugType: parsed.rugType,
      draft: parsed.draft,
    };
  } catch (err) {
    return { id, audit: { pass: false, reason: `error: ${err instanceof Error ? err.message : err}` } };
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set"); process.exit(1);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Newly-fetched IDs = everything in public/rugs/ that's NOT in KEEP_IDS.
  const allIds = (await readdir(RUGS_DIR))
    .filter((f) => /^\d+\.jpg$/.test(f))
    .map((f) => f.replace(/\.jpg$/, ""));
  const toProcess = allIds.filter((id) => !KEEP_IDS.has(id));
  console.log(`Processing ${toProcess.length} newly-fetched rugs (skipping ${allIds.length - toProcess.length} already-drafted)…`);

  const results: Result[] = [];
  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);
    process.stdout.write(`batch ${Math.floor(i / CONCURRENCY) + 1}: `);
    const r = await Promise.all(batch.map((id) => processOne(client, id)));
    for (const v of r) {
      results.push(v);
      process.stdout.write(`${v.id}${v.audit.pass ? "✓" : "✗"} `);
    }
    process.stdout.write("\n");
  }

  // Persist audit.
  await writeFile(OUT_AUDIT, JSON.stringify(results, null, 2));
  const pass = results.filter((r) => r.audit.pass);
  console.log(`\nAudit: ${pass.length} pass / ${results.length - pass.length} fail. Saved ${OUT_AUDIT}`);

  // Merge passing drafts with the 20 already-existing drafts.
  let existing: SeedDraft[] = [];
  try {
    const raw = await readFile(OUT_SEEDS, "utf8");
    existing = JSON.parse(raw);
    console.log(`Loaded ${existing.length} existing seeds from ${OUT_SEEDS}`);
  } catch {}

  const newDrafts: SeedDraft[] = pass
    .filter((r) => r.draft)
    .map((r) => ({ id: parseInt(r.id, 10), ...(r.draft as Omit<SeedDraft, "id">) }));

  const merged = [...existing, ...newDrafts];
  await writeFile(OUT_SEEDS, JSON.stringify(merged, null, 2));
  console.log(`Wrote ${merged.length} total seeds to ${OUT_SEEDS}`);

  // Diversity report.
  const byType: Record<string, number> = {};
  for (const r of pass) {
    if (r.rugType) byType[r.rugType] = (byType[r.rugType] ?? 0) + 1;
  }
  console.log(`\nNew rugs by type:`);
  for (const [t, n] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(28)} ${n}`);
  }

  // Save fail list so we know what to delete.
  const failIds = results.filter((r) => !r.audit.pass).map((r) => r.id);
  await writeFile(
    path.resolve(process.cwd(), "lib/catalog/rug-fails.json"),
    JSON.stringify(failIds, null, 2),
  );
  console.log(`\n${failIds.length} fail IDs saved to lib/catalog/rug-fails.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
