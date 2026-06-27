/**
 * AI-draft fixture entries for the 20 newly fetched upstream rugs. Asks Claude
 * vision to extract structured fields from each rug photograph (origin, era,
 * color palette, design features, distinguishing notes, lead prose), formats
 * them as Seed objects that drop directly into lib/catalog/fixtures.ts.
 *
 * All output entries are marked draft: true / age.verified: false / provenance
 * .verified: false so nothing publishes without editor review.
 *
 * Concurrency: 5 in parallel — 20 calls finish in ~30-50s.
 *
 *   pnpm tsx scripts/draft-new-fixtures.ts
 *
 * Writes: lib/catalog/new-fixture-seeds.json  (review, then merge by hand)
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const NEW_IDS = [
  "89134", "89111", "89090", "89082", "89068", "88889", "88885", "88859",
  "88857", "88855", "88853", "88851", "88849", "88847", "88845", "88843",
  "88841", "88839", "88837", "88834",
];

const MODEL = "claude-sonnet-4-6"; // matches lib/ai/client.ts (CLAUDE.md pin)
const CONCURRENCY = 5;
const PUBLIC_RUGS = path.resolve(process.cwd(), "public", "rugs");
const OUT = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");

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

const PROMPT = `You are looking at a photograph of a rug from the Oscar Isberian Rugs catalog (Chicago heritage rug house). Your job is to draft a STRUCTURED catalog entry for this rug. Output VALID JSON only — no prose around it, no markdown fence.

The voice of the house: master dealer, century of family practice. Warm, precise, unhurried, never pushy. Specific over superlative. No "exquisite", "masterpiece", "stunning". No emoji. Provenance over hype.

Required JSON shape (every field):
{
  "title": "<6-10 word descriptive title, e.g. 'Caucasian Soumak Runner with Multi-Strip Border'>",
  "size": "<best-guess imperial size like \\"4'0\\" × 10'0\\"\\" — guess from the rug's aspect ratio; runner=2'6\\"-3'6\\" wide × 8'-16' long; scatter=3'-5' wide × 5'-7' long; accent=5'-6' wide × 7'-9' long; room=8'-9' wide × 10'-12' long; oversize=10'+ wide>",
  "condition": "Excellent.|Very good.|Good.|Some restoration noted.",
  "origin": "Persian|Turkish|Caucasian|Contemporary|Moroccan|Indian|Tibetan|Scandinavian",
  "region": "<weaving region if identifiable: 'Tabriz', 'Heriz', 'Sarouk', 'Kazak', 'Karabagh', 'Shirvan', 'Sivas', 'Oushak', 'Konya', etc. — omit field if uncertain>",
  "age": "<era like 'c. 1900', 'c. 1920', 'Mid-20th century', 'Late 20th century', 'Contemporary' — leave conservative on antiques>",
  "technique": "Hand-knotted|Hand-woven (flatweave)",
  "materials": ["Wool"] or ["Wool", "Silk"] or ["Silk"] or ["Wool & silk"] or ["Cotton"],
  "pile": "Low|Medium|High",
  "lead": "<one paragraph, max 240 chars. Describe what you can SEE — palette, motif, field, border, condition. No marketing varnish. No emoji.>",
  "enrichment": {
    "colorPalette": [
      { "name": "<color description, e.g. 'deep madder'>", "hex": "<approximate hex like '#9F3B2E'>", "weight": "primary|secondary|accent" }
    ],
    "designFeatures": [<3-6 short noun phrases for visible motifs/features, e.g. "central medallion", "all-over Herati", "running-dog border", "stepped spandrels">],
    "distinguishing": [<2-3 short notes for genuinely uncommon things you see — leave empty array if nothing stands out>]
  },
  "collection": "<one of: antique-persian|antique-turkish|antique-caucasian|contemporary|custom — pick the best match>"
}

CRITICAL:
- All identifications are PRELIMINARY. Hedge: if it could be Caucasian OR Persian, pick the more likely and let editor verify.
- Never invent details you can't see (knot count, weaver name, dye type beyond color).
- The "lead" is the most important field. It should be a sentence or two that lets a reader picture the rug.
- Output ONLY the JSON. No "Here is the entry" preamble, no \`\`\`json fence.`;

async function draftOne(client: Anthropic, id: string): Promise<SeedDraft | null> {
  const imgPath = path.join(PUBLIC_RUGS, `${id}.jpg`);
  const buf = await readFile(imgPath);
  const b64 = buf.toString("base64");
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
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
    // Strip a leading ```json fence if the model defied instructions.
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const parsed = JSON.parse(cleaned) as Omit<SeedDraft, "id">;
    return { id: parseInt(id, 10), ...parsed };
  } catch (err) {
    console.warn(`  ${id}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set");
    process.exit(1);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log(`Drafting fixture entries for ${NEW_IDS.length} rugs (concurrency ${CONCURRENCY}) …`);
  const drafts: SeedDraft[] = [];

  // Process in batches of CONCURRENCY for steady throughput.
  for (let i = 0; i < NEW_IDS.length; i += CONCURRENCY) {
    const batch = NEW_IDS.slice(i, i + CONCURRENCY);
    process.stdout.write(`batch ${i / CONCURRENCY + 1}: `);
    const results = await Promise.all(batch.map((id) => draftOne(client, id)));
    for (const r of results) {
      if (r) {
        drafts.push(r);
        process.stdout.write(`${r.id} `);
      }
    }
    process.stdout.write("\n");
  }

  await writeFile(OUT, JSON.stringify(drafts, null, 2));
  console.log(`\nDrafted ${drafts.length}/${NEW_IDS.length}. Wrote ${OUT}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
