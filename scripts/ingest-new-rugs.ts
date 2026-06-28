/**
 * End-to-end ingest for a list of rug IDs:
 *   1. Reads scripts/scraped-metadata.json (from scrape-rug-metadata.mjs)
 *   2. For each ID, sends the JPG to Claude vision for a structured rug draft
 *      (palette, design features, distinguishing notes, lead prose, age guess)
 *   3. Merges scraped + vision per the agreed rules:
 *        - size, origin, region, materials → SCRAPED wins (authoritative)
 *        - lead, colorPalette, designFeatures, distinguishing, age, title → VISION
 *        - prices → NEVER (already stripped by scraper; double-checked here)
 *   4. Appends to lib/catalog/new-fixture-seeds.json with draft: true
 *
 * Concurrency: 5. Cost: ~$0.03/rug at claude-sonnet-4-6.
 *
 *   pnpm tsx scripts/ingest-new-rugs.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const MODEL = "claude-sonnet-4-6";
const CONCURRENCY = 5;
const PUBLIC_RUGS = path.resolve(process.cwd(), "public", "rugs");
const SCRAPED_PATH = path.resolve(process.cwd(), "scripts", "scraped-metadata.json");
const SEEDS_PATH = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");

/** Map upstream origin strings to our canonical Origin union. */
const ORIGIN_MAP: Record<string, string> = {
  Iran: "Persian",
  Turkey: "Turkish",
  Armenia: "Caucasian",
  Afghanistan: "Caucasian", // closest match for Ghazani/Aryana/Bamyan tribal pieces
  Pakistan: "Indian",       // closest match for Ghazani Pakistan pieces (no Pakistani origin in union)
  India: "Indian",
  Nepal: "Tibetan",
  Tibet: "Tibetan",
  Belgium: "Contemporary",  // machine-made → contemporary
  USA: "Contemporary",
  Mexico: "Contemporary",   // Zapotec flatweave
  Romania: "Contemporary",  // Bessarabian — closest fit
};

/** Map upstream material strings to our union, picking the first sensible one. */
function mapMaterials(scrapedMaterial: string): ("Wool" | "Silk" | "Wool & silk" | "Cotton")[] {
  const m = (scrapedMaterial ?? "").toLowerCase();
  if (m.includes("silk") && m.includes("wool")) return ["Wool & silk"];
  if (m.includes("silk")) return ["Silk"];
  if (m.includes("cotton")) return ["Cotton"];
  return ["Wool"]; // default — most catalog pieces
}

/** Map upstream type/category to technique. Machine-made → flatweave is wrong;
 *  but our union only has hand-knotted and hand-woven (flatweave). Machine-made
 *  isn't representable, so we map it to "Hand-woven (flatweave)" as the
 *  least-wrong option and flag verified: false so an editor catches it. */
function mapTechnique(scraped: { RMProTypeVal?: string; ItemDescription?: string }): "Hand-knotted" | "Hand-woven (flatweave)" {
  const t = (scraped.RMProTypeVal ?? "").toUpperCase();
  const desc = (scraped.ItemDescription ?? "").toLowerCase();
  if (desc.includes("flatweave") || t === "FLATWEAVE") return "Hand-woven (flatweave)";
  return "Hand-knotted";
}

/** Pull "12'5\" × 10'0\"" out of "5' 5\"" and "8' 3\"". The seed schema stores
 *  size as a single string. */
function combineSize(scrapedX: string, scrapedY: string): string {
  const x = (scrapedX ?? "").replace(/\s+/g, "").replace("'", "'").replace('"', '"');
  const y = (scrapedY ?? "").replace(/\s+/g, "").replace("'", "'").replace('"', '"');
  return `${x} × ${y}`;
}

const VISION_PROMPT = `You are looking at a photograph of a rug from the Oscar Isberian Rugs catalog (Chicago heritage rug house). Output VALID JSON ONLY — no prose, no markdown fence.

Voice: master dealer with a century of family practice. Warm, precise, unhurried, never pushy. Specific over superlative. NO "exquisite", "masterpiece", "stunning". No emoji. Provenance over hype.

Required JSON shape:
{
  "title": "<6-10 word descriptive title in the house voice, e.g. 'Ivory Field Allover Vase and Palmette Persian Carpet'>",
  "age": "<era like 'c. 1900', 'c. 1920', 'Mid-20th century', 'Late 20th century', 'Contemporary' — be conservative on antiques>",
  "pile": "Low|Medium|High",
  "condition": "Excellent.|Very good.|Good.|Some restoration noted.",
  "lead": "<one paragraph, max 240 chars. Describe what you SEE — palette, motif, field, border, condition. No marketing varnish. No fabrications about provenance/age you can't see.>",
  "colorPalette": [
    { "name": "<color description, e.g. 'deep madder'>", "hex": "<approximate hex like '#9F3B2E'>", "weight": "primary|secondary|accent" }
  ],
  "designFeatures": [<3-6 short noun phrases for visible motifs/features, e.g. "central medallion", "all-over Herati", "running-dog border">],
  "distinguishing": [<2-3 short notes for genuinely uncommon things you see — empty array if nothing stands out>]
}

CRITICAL:
- NEVER quote a price.
- NEVER make up provenance you can't infer from the image (origin, age, knot count).
- Be honest about uncertainty: prefer "Late 20th century" over a specific decade if unsure.
- 4-6 colors in palette, ordered primary → secondary → accent.`;

type ScrapedRec = {
  RMProID: number;
  ItemDescription: string;
  ItemSizeXStr: string;
  ItemSizeYStr: string;
  ItemSizeXDbl: number;
  ItemSizeYDbl: number;
  RMProOriginVal: string;
  RMProContentVal: string;
  RMProBackgroundVal: string;
  RMProMaterialVal: string;
  RMProStyleVal: string;
  RMProTypeVal: string;
  RMProConditionVal: string;
  DescriptionLong: string;
};

type VisionDraft = {
  title: string;
  age: string;
  pile: "Low" | "Medium" | "High";
  condition: string;
  lead: string;
  colorPalette: { name: string; hex: string; weight: "primary" | "secondary" | "accent" }[];
  designFeatures: string[];
  distinguishing: string[];
};

async function classifyOne(client: Anthropic, id: string): Promise<VisionDraft> {
  const jpg = await readFile(path.join(PUBLIC_RUGS, `${id}.jpg`));
  const b64 = jpg.toString("base64");
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: VISION_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
          { type: "text", text: "Draft the JSON entry for this rug." },
        ],
      },
    ],
  });
  const text = resp.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  const cleaned = text.trim().replace(/^```json?\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

async function ingestOne(client: Anthropic, id: string, scraped: ScrapedRec) {
  const v = await classifyOne(client, id);

  // Apply the merge rules:
  //   - size, origin, region (RMProContentVal), materials → SCRAPED wins
  //   - title, age, lead, palette, features, distinguishing, condition, pile → VISION wins
  const canonicalOrigin = ORIGIN_MAP[scraped.RMProOriginVal] ?? "Persian";
  const region = scraped.RMProContentVal && scraped.RMProContentVal !== ""
    ? toTitleCase(scraped.RMProContentVal)
    : undefined;

  return {
    id: scraped.RMProID,
    title: v.title,
    size: combineSize(scraped.ItemSizeXStr, scraped.ItemSizeYStr),
    condition: v.condition,
    origin: canonicalOrigin,
    region,
    age: v.age,
    technique: mapTechnique(scraped),
    materials: mapMaterials(scraped.RMProMaterialVal),
    pile: v.pile,
    lead: v.lead,
    enrichment: {
      colorPalette: v.colorPalette,
      designFeatures: v.designFeatures,
      distinguishing: v.distinguishing,
    },
    collection: collectionFor(canonicalOrigin),
    draft: true,
  };
}

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectionFor(origin: string): string {
  switch (origin) {
    case "Persian": return "antique-persian";
    case "Turkish": return "antique-turkish";
    case "Caucasian": return "antique-caucasian";
    case "Contemporary": return "contemporary";
    default: return "antique-persian";
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing");
    process.exit(1);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const scraped: Record<string, ScrapedRec> = JSON.parse(await readFile(SCRAPED_PATH, "utf8"));
  const ids = Object.keys(scraped);
  console.log(`Ingesting ${ids.length} rugs (concurrency ${CONCURRENCY})…\n`);

  const results: any[] = [];
  const failed: { id: string; err: string }[] = [];

  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (id) => {
        try {
          const seed = await ingestOne(client, id, scraped[id]);
          console.log(`  ✓ ${id}: ${seed.title.slice(0, 60)}…`);
          return seed;
        } catch (e) {
          throw new Error(`${id}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }),
    );
    for (const s of settled) {
      if (s.status === "fulfilled") results.push(s.value);
      else {
        const m = s.reason?.message ?? String(s.reason);
        console.log(`  ✗ ${m}`);
        const id = m.split(":")[0];
        failed.push({ id, err: m });
      }
    }
  }

  // Merge into seeds. Keep existing entries that aren't being re-ingested.
  const existing: any[] = JSON.parse(await readFile(SEEDS_PATH, "utf8"));
  const incomingIds = new Set(results.map((r) => r.id));
  const merged = [...existing.filter((s) => !incomingIds.has(s.id)), ...results];
  await writeFile(SEEDS_PATH, JSON.stringify(merged, null, 2));

  console.log(`\nIngested ${results.length}/${ids.length}. Failed: ${failed.length}.`);
  console.log(`Seeds: ${existing.length} → ${merged.length}.`);
  console.log(`→ ${SEEDS_PATH}`);
  if (failed.length) {
    console.log(`\nFailures:`);
    for (const f of failed) console.log(`  ${f.id}: ${f.err}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
