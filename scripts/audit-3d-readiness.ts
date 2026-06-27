/**
 * Strict Claude-vision audit for 3D/AR-readiness, applied to every rug in
 * lib/catalog/new-fixture-seeds.json.
 *
 * Criteria (must ALL pass):
 *   1. Top-down (camera within ~10° of straight overhead) — the rug appears
 *      as a clean rectangle, not a trapezoid.
 *   2. Background is uniform / already-tight crop — alpha masking will
 *      produce a clean cutout. (Tight-cropped-with-no-background is fine.)
 *   3. Rectangular edges — rug outline is a clean rectangle, no curve, no
 *      missing corner.
 *   4. No non-rug objects in frame (hands, labels, mannequins, watermarks).
 *   5. Resolution and lighting good enough that the rug texture isn't
 *      grainy or color-shifted.
 *
 * PASS the rug if all 5 hold. Otherwise FAIL.
 *
 * Permissive on:
 *   - Dates / inscriptions WOVEN INTO the rug field (part of the design)
 *   - Natural pile / texture variation
 *   - Age signs (wear, slight fading) — those are character, not defects
 *
 *   pnpm tsx scripts/audit-3d-readiness.ts
 *
 * Writes: lib/catalog/rug-3d-audit.json (per-rug verdict + reasoning)
 */
import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const MODEL = "claude-sonnet-4-6";
const CONCURRENCY = 5;
const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const SEEDS_PATH = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
const AUDIT_OUT = path.resolve(process.cwd(), "lib", "catalog", "rug-3d-audit.json");

type Verdict = {
  id: string;
  fit: "pass" | "fail";
  topDown: boolean;
  cleanEdges: boolean;
  cleanBackground: boolean;
  noObjects: boolean;
  reason: string;
};

const PROMPT = `You are auditing a single rug photograph for use as a 3D model — the photo will be warped onto a flat plane and viewed in augmented reality on a phone. Be STRICT. Return ONLY a JSON object.

A photo passes ONLY IF all of these hold:

1. **Top-down**: the rug looks like it was shot straight from above (within ~10° of vertical). The rug appears as a clean rectangle, NOT a trapezoid. Reject anything that's clearly hung on a wall, draped, or shot at an angle.

2. **Clean edges**: the rug outline is a clean rectangle. Reject anything with missing corners, dramatic asymmetric wear, or rounded shapes (no oval / round rugs).

3. **Clean background OR tight crop**: either (a) the rug fills the frame entirely (no visible background to clean up) OR (b) the background is uniform and clearly distinguishable from the rug (solid white/cream backdrop). Reject if the background is busy / textured / contains other objects.

4. **No non-rug objects**: no hands, fingers, mannequins, watermarks, label cards, price tags, scale references, or text overlays. Reject these.

5. **Sharp + color-accurate**: resolution and lighting are good enough that the rug looks photographic, not grainy or blown out.

BE PERMISSIVE on these — they are NOT reasons to fail:
- Dates or inscriptions woven INTO the rug field (part of the design)
- Natural pile / texture variation
- Age signs: wear, restoration, slight fading — that's character

Output ONLY this JSON shape:
{
  "fit": "pass" | "fail",
  "topDown": true | false,
  "cleanEdges": true | false,
  "cleanBackground": true | false,
  "noObjects": true | false,
  "reason": "<one short sentence>"
}`;

async function auditOne(client: Anthropic, id: string): Promise<Verdict> {
  const imgPath = path.join(RUGS_DIR, `${id}.jpg`);
  try {
    const buf = await readFile(imgPath);
    const b64 = buf.toString("base64");
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 250,
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
    return {
      id,
      fit: "fail",
      topDown: false,
      cleanEdges: false,
      cleanBackground: false,
      noObjects: false,
      reason: `error: ${err instanceof Error ? err.message : err}`,
    };
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set");
    process.exit(1);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const seeds = JSON.parse(await readFile(SEEDS_PATH, "utf8"));
  const ids = seeds.map((s: { id: number }) => String(s.id));
  console.log(`Strict 3D-readiness audit on ${ids.length} rugs (concurrency ${CONCURRENCY})…`);

  const results: Verdict[] = [];
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY);
    const r = await Promise.all(batch.map((id) => auditOne(client, id)));
    for (const v of r) {
      results.push(v);
      const tag = v.fit === "pass" ? "PASS" : "FAIL";
      console.log(`  ${tag.padEnd(4)} ${v.id}  ${v.reason}`);
    }
  }

  await writeFile(AUDIT_OUT, JSON.stringify(results, null, 2));

  const passing = results.filter((r) => r.fit === "pass");
  const failing = results.filter((r) => r.fit === "fail");
  console.log(`\n${passing.length} / ${results.length} pass strict 3D criteria.`);
  console.log(`Saved verdicts to ${AUDIT_OUT}.`);
  console.log(`\nFailing IDs (will be deleted by finalize step):`);
  console.log(`  ${failing.map((f) => f.id).join(", ")}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
