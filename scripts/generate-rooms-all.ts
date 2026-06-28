/**
 * Generate one "suggested setting" room image per rug in the catalog.
 *
 * For each rug in new-fixture-seeds.json:
 *   - Skip if public/rugs/<id>-room.png already exists (idempotent).
 *   - Build a prompt from the rug's RugDescription (palette, era, region,
 *     materials, pile, size — same logic as scripts/room-from-rug.ts).
 *   - Call Flux 1.1 Pro on Replicate, save the PNG to public/rugs/<id>-room.png.
 *   - Patch the seed JSON in place with suggestedRoomUrl: "/rugs/<id>-room.png".
 *
 * Replicate throttles to 6/min with a burst of 1 under $5 balance, so we run
 * with a small concurrency pool and retry-on-429 backoff. Effective throughput
 * is roughly 5–6 rugs/min until the credit balance climbs, at which point the
 * pool fills naturally.
 *
 *   pnpm tsx scripts/generate-rooms-all.ts                  # all rugs missing rooms
 *   pnpm tsx scripts/generate-rooms-all.ts --force          # regenerate every rug
 *   pnpm tsx scripts/generate-rooms-all.ts --only 17600,20300
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN not set in .env.local");
  process.exit(1);
}

const SEEDS = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
const PUBLIC_RUGS = path.resolve(process.cwd(), "public", "rugs");

const CONCURRENCY = 3;
const MAX_RETRIES = 6;

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const onlyArg = process.argv.find((a, i, arr) => arr[i - 1] === "--only");
const ONLY_IDS = onlyArg ? new Set(onlyArg.split(",").map((s) => s.trim())) : null;

type PaletteEntry = { name: string; hex: string; weight: "primary" | "secondary" | "accent" };
type Rug = {
  id: number;
  title: string;
  size: string;
  origin: string;
  region?: string;
  age: string;
  technique: string;
  materials: string[];
  pile: string;
  lead: string;
  enrichment?: {
    colorPalette?: PaletteEntry[];
    designFeatures?: string[];
    distinguishing?: string[];
  };
  suggestedRoomUrl?: string;
};

function settingFromSize(size: string): { room: string; furniture: string } {
  const m = size.match(/(\d+)'\s*(\d+)?"?\s*[×x]\s*(\d+)'\s*(\d+)?"?/);
  if (!m) return { room: "a large drawing room", furniture: "a low sofa, a pair of armchairs, a console table" };
  const w = parseInt(m[1] ?? "0", 10) * 12 + parseInt(m[2] ?? "0", 10);
  const l = parseInt(m[3] ?? "0", 10) * 12 + parseInt(m[4] ?? "0", 10);
  const longEdgeFt = Math.max(w, l) / 12;
  const aspect = Math.min(w, l) / Math.max(w, l);
  if (aspect < 0.45) return { room: "a long traditional hallway with a wood floor", furniture: "a console table with a brass lamp at the far end, two framed prints on the wall" };
  if (longEdgeFt < 6) return { room: "a quiet bedside vignette", furniture: "a low upholstered headboard, a walnut nightstand, a brass reading lamp" };
  if (longEdgeFt < 10) return { room: "an intimate sitting room", furniture: "a single tufted armchair, a side table with a brass lamp, a small writing desk" };
  if (longEdgeFt >= 14) return { room: "a grand formal dining room", furniture: "a long polished wood dining table with eight upholstered chairs, a brass chandelier overhead" };
  return { room: "a generous living room", furniture: "a low sectional sofa, a pair of armchairs, a marble coffee table, a console along the back wall" };
}

function lightFromPalette(palette: PaletteEntry[]): string {
  const primary = palette.find((p) => p.weight === "primary") ?? palette[0];
  if (!primary) return "soft afternoon light through tall windows";
  const hex = primary.hex.toLowerCase();
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const warm = r > b + 20;
  const dark = (r + g + b) / 3 < 110;
  if (warm && dark) return "warm tungsten light from a single lamp, late evening";
  if (warm) return "late afternoon golden hour light through tall windows";
  if (dark) return "cool northern daylight, slightly overcast";
  return "soft diffuse daylight from north-facing windows";
}

function styleFromRug(rug: Rug): string {
  const age = rug.age.toLowerCase();
  const origin = rug.origin.toLowerCase();
  const isAntique = /18\d{2}|19[01]/.test(age) || age.includes("antique");
  const isContemporary = age.includes("contemporary") || /20[0-2]\d/.test(age);
  if (isContemporary) return "minimal contemporary interior, plaster walls, raw oak floor, restrained furnishings, gallery sensibility";
  if (origin.includes("caucasian") || origin.includes("kazak") || origin.includes("shirvan") || origin.includes("karabagh")) {
    return "architectural modernist room, white plaster walls, mid-century furniture in walnut and black leather, clean lines";
  }
  if (origin.includes("turkish") || origin.includes("oushak") || origin.includes("sivas")) {
    return "warm traditional interior, lime-washed walls, oak floors, low Mediterranean furniture, simple linen upholstery";
  }
  if (isAntique && (origin.includes("persian") || origin.includes("tabriz") || origin.includes("sultanabad") || origin.includes("heriz") || origin.includes("kerman"))) {
    return "traditional gentleman's library, walnut wainscot, leather-bound books on built-in shelves, a deep wing chair, a wooden writing desk";
  }
  return "warm classical interior, plaster walls, hardwood floor, upholstered seating, brass details";
}

function buildPrompt(rug: Rug): string {
  const setting = settingFromSize(rug.size);
  const light = lightFromPalette(rug.enrichment?.colorPalette ?? []);
  const style = styleFromRug(rug);

  const palette = (rug.enrichment?.colorPalette ?? []).map((p) => `${p.name.toLowerCase()} (${p.hex})`).join(", ");
  const primary = (rug.enrichment?.colorPalette ?? []).find((p) => p.weight === "primary");
  const secondary = (rug.enrichment?.colorPalette ?? []).filter((p) => p.weight === "secondary").map((p) => p.name.toLowerCase());

  const rugDescription = `a ${rug.size} hand-knotted ${rug.origin} ${rug.region ? rug.region + " " : ""}rug, ${rug.age}, ${(rug.materials ?? ["wool"]).join(" and ").toLowerCase()}, ${(rug.pile ?? "low").toLowerCase()} pile, on the floor — ${rug.lead.toLowerCase().replace(/\.$/, "")}`;

  return [
    "Photorealistic editorial interior photograph, shot on medium-format film, shallow grain.",
    `Scene: ${setting.room}.`,
    `Style register: ${style}.`,
    `Furnishings: ${setting.furniture}.`,
    `Lighting: ${light}.`,
    `Wall and upholstery palette tuned to complement the rug — primary tones around ${primary?.name.toLowerCase() ?? "warm neutral"} and accents in ${secondary.join(", ") || "soft warm neutrals"}; never out-saturate the rug.`,
    `On the floor: ${rugDescription}.${palette ? ` Rug colors: ${palette}.` : ""}`,
    "Composition: the rug is the room's anchor; furniture frames but does not crowd it; eye-level camera, ample negative space, no people, no clutter, no text or signage.",
    "Reference: Architectural Digest, Vogue Living, restrained gallery-style editorial photography.",
  ].join(" ");
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function generate(prompt: string, retries = 0): Promise<string> {
  const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: "3:2",
        output_format: "png",
        output_quality: 95,
        safety_tolerance: 5,
        prompt_upsampling: true,
      },
    }),
  });

  // Rate-limit: sleep retry_after then try again.
  if (res.status === 429 && retries < MAX_RETRIES) {
    const body = await res.json().catch(() => ({ retry_after: 12 }));
    const wait = (body.retry_after ?? 12) * 1000 + 500;
    await new Promise((r) => setTimeout(r, wait));
    return generate(prompt, retries + 1);
  }
  if (!res.ok) throw new Error(`replicate ${res.status}: ${await res.text()}`);

  let prediction = await res.json();
  while (prediction.status !== "succeeded" && prediction.status !== "failed") {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(prediction.urls.get, { headers: { Authorization: `Bearer ${TOKEN}` } });
    prediction = await poll.json();
  }
  if (prediction.status === "failed") throw new Error(prediction.error ?? "prediction failed");
  const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!url) throw new Error("no output url");
  return url;
}

async function processOne(rug: Rug, idx: number, total: number): Promise<{ id: number; ok: boolean; reason?: string }> {
  const outFile = path.join(PUBLIC_RUGS, `${rug.id}-room.png`);
  if (!FORCE && (await fileExists(outFile))) {
    console.log(`  [${idx + 1}/${total}] ${rug.id} skipped (exists)`);
    return { id: rug.id, ok: true, reason: "exists" };
  }
  const prompt = buildPrompt(rug);
  try {
    const url = await generate(prompt);
    const ab = (await (await fetch(url)).arrayBuffer()) as ArrayBuffer;
    const buf = Buffer.from(ab);
    await writeFile(outFile, buf);
    console.log(`  [${idx + 1}/${total}] ${rug.id} → ${outFile.replace(process.cwd(), ".")} (${(buf.length / 1024).toFixed(0)} KB)`);
    return { id: rug.id, ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  [${idx + 1}/${total}] ${rug.id} FAILED: ${msg}`);
    return { id: rug.id, ok: false, reason: msg };
  }
}

/** Bounded-concurrency map — keeps `CONCURRENCY` predictions in flight. */
async function pool<T, R>(items: T[], n: number, worker: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function runner() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]!, i);
    }
  }
  await Promise.all(Array.from({ length: n }, runner));
  return results;
}

async function main() {
  await mkdir(PUBLIC_RUGS, { recursive: true });
  const seeds: Rug[] = JSON.parse(await readFile(SEEDS, "utf8"));
  const targets = ONLY_IDS
    ? seeds.filter((r) => ONLY_IDS.has(String(r.id)))
    : seeds;
  console.log(`Generating rooms for ${targets.length} rug(s) (concurrency ${CONCURRENCY}${FORCE ? ", force" : ""})…\n`);

  const results = await pool(targets, CONCURRENCY, (rug, i) => processOne(rug, i, targets.length));

  // Patch the seeds in-place with suggestedRoomUrl when the file is present.
  let patched = 0;
  for (const seed of seeds) {
    const expected = path.join(PUBLIC_RUGS, `${seed.id}-room.png`);
    if (await fileExists(expected)) {
      const url = `/rugs/${seed.id}-room.png`;
      if (seed.suggestedRoomUrl !== url) {
        seed.suggestedRoomUrl = url;
        patched++;
      }
    }
  }
  if (patched > 0) {
    await writeFile(SEEDS, JSON.stringify(seeds, null, 2));
    console.log(`\nPatched ${patched} seed(s) with suggestedRoomUrl.`);
  }

  const ok = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\nDone. ${ok}/${results.length} succeeded.`);
  if (failed.length > 0) {
    console.log(`Failed: ${failed.map((f) => `${f.id} (${f.reason})`).join(", ")}`);
    console.log(`Re-run the script to retry the failures (it skips ones that already wrote a file).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
