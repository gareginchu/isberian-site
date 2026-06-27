/**
 * Audit every rug image in public/rugs/ against the visualizer's quality
 * criteria. Uses Claude vision to evaluate each photo on:
 *
 *   1. Top-down or near-top-down shot
 *   2. Rug fills the frame (no significant background showing)
 *   3. No distracting elements (mannequins, hands, watermarks, etc.)
 *   4. Reasonable resolution and color
 *
 * Output: lib/catalog/rug-audit.json — one record per rug with verdict + reasons.
 * Concurrency: 5 parallel calls.
 *
 *   pnpm tsx scripts/audit-rug-images.ts
 *
 * I do NOT delete from this script. After review, scripts/delete-failed-rugs.ts
 * (next file) reads the JSON and removes failing images + their fixture entries
 * + their CLIP embeddings.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const MODEL = "claude-sonnet-4-6";
const CONCURRENCY = 5;
const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const OUT = path.resolve(process.cwd(), "lib", "catalog", "rug-audit.json");

type Verdict = {
  id: string;
  fit: "pass" | "fail";
  topDown: boolean;
  tightCrop: boolean;
  noDistractions: boolean;
  resolution: "good" | "ok" | "poor";
  reason: string;
};

const PROMPT = `You are auditing a rug photograph for use in a visualizer that warps the rug onto a room's floor. Evaluate strictly. Return ONLY a JSON object — no prose, no markdown fence.

Required output shape:
{
  "topDown": true | false,            // shot looks like the camera is roughly above the rug, not at a strong angle
  "tightCrop": true | false,           // the rug fills most of the frame; no significant background visible
  "noDistractions": true | false,      // no hands, mannequins, fingers, label cards, watermarks, room context
  "resolution": "good" | "ok" | "poor",
  "fit": "pass" | "fail",              // overall verdict — must pass ALL of topDown, tightCrop, noDistractions, and resolution >= "ok"
  "reason": "<one short sentence explaining the verdict, e.g. 'angled studio shot with visible easel' or 'clean top-down, tight crop, ready for compositing'>"
}

Be strict. If any criterion is borderline, fail it. We're filtering for visualizer-ready imagery only — antique-catalog candor photography (rugs draped or hung, room shots, angled studio) all FAIL.`;

async function auditOne(client: Anthropic, id: string): Promise<Verdict | null> {
  const imgPath = path.join(RUGS_DIR, `${id}.jpg`);
  try {
    const buf = await readFile(imgPath);
    const b64 = buf.toString("base64");
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
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
    return { id, ...parsed };
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

  const ids = (await readdir(RUGS_DIR))
    .filter((f) => /^\d+\.jpg$/.test(f))
    .map((f) => f.replace(/\.jpg$/, ""))
    .sort();
  console.log(`Auditing ${ids.length} rug images (concurrency ${CONCURRENCY}) …`);

  const verdicts: Verdict[] = [];
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((id) => auditOne(client, id)));
    for (const v of results) {
      if (v) {
        verdicts.push(v);
        const tag = v.fit === "pass" ? "PASS" : "FAIL";
        console.log(`  ${tag} ${v.id}  ${v.reason}`);
      }
    }
  }

  await writeFile(OUT, JSON.stringify(verdicts, null, 2));
  const passes = verdicts.filter((v) => v.fit === "pass").length;
  const fails = verdicts.filter((v) => v.fit === "fail").length;
  console.log(`\n${passes}/${verdicts.length} pass · ${fails} fail`);
  console.log(`Wrote ${OUT}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
