/**
 * Generate four "lifestyle" room scenes per rug — same shape as the row at the
 * bottom of isberian.com's rug pages, but rug-aware: each scene shows THIS
 * rug rendered into a different interior via Flux Kontext Pro.
 *
 * Scenes: library, modern-living, dining, bedroom. Kontext gets the rug's
 * top-down photo as input and an instruction to place it in the named
 * interior. Pattern fidelity isn't pixel-perfect (the rug's product photo
 * lives above the lifestyle row, that's the definitive image) but identity,
 * palette, and proportions survive.
 *
 * Idempotent (skips files that already exist). Patches new-fixture-seeds.json
 * in place with a `lifestyle: [{slug, label, src}]` array per rug.
 *
 *   pnpm tsx scripts/generate-lifestyle-all.ts
 *   pnpm tsx scripts/generate-lifestyle-all.ts --force
 *   pnpm tsx scripts/generate-lifestyle-all.ts --only 17600,20300
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN not set");
  process.exit(1);
}

const SEEDS = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
const OUT_DIR = path.resolve(process.cwd(), "public", "rugs", "lifestyle");
const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");

const CONCURRENCY = 3;
const MAX_RETRIES = 6;

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const onlyArg = process.argv.find((a, i, arr) => arr[i - 1] === "--only");
const ONLY_IDS = onlyArg ? new Set(onlyArg.split(",").map((s) => s.trim())) : null;

type Scene = { slug: string; label: string; instruction: string };

const SCENES: Scene[] = [
  {
    slug: "library",
    label: "In a traditional library",
    instruction:
      "Place this exact rug on the hardwood floor of a traditional gentleman's library. Walnut wainscoting, leather-bound books on built-in shelves, a deep wing chair angled toward the rug, late afternoon golden-hour light through tall windows. Eye-level photograph from a comfortable seated angle. Preserve the rug's pattern, colors, and proportions exactly.",
  },
  {
    slug: "modern-living",
    label: "In a modern living room",
    instruction:
      "Place this exact rug on the floor of a minimal contemporary living room. White plaster walls, raw oak floor, low sectional sofa in oatmeal linen, a marble coffee table. Soft north-facing daylight. Eye-level photograph. Preserve the rug's pattern, colors, and proportions exactly.",
  },
  {
    slug: "dining",
    label: "Under a dining table",
    instruction:
      "Place this exact rug under a polished walnut dining table with six upholstered chairs in a formal dining room. Brass chandelier overhead, lime-washed plaster walls, large windows with linen curtains. Eye-level photograph from one end of the table. Preserve the rug's pattern, colors, and proportions exactly.",
  },
  {
    slug: "bedroom",
    label: "At the foot of a bed",
    instruction:
      "Place this exact rug at the foot of a bed in a calm, restrained bedroom. Linen-upholstered headboard, walnut nightstands, soft morning light through sheer curtains. Eye-level photograph. Preserve the rug's pattern, colors, and proportions exactly.",
  },
];

type Rug = {
  id: number;
  title: string;
  lifestyle?: { slug: string; label: string; src: string }[];
};

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function generate(dataUri: string, instruction: string, retries = 0): Promise<string> {
  const res = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          input_image: dataUri,
          prompt: instruction,
          aspect_ratio: "3:2",
          output_format: "png",
          safety_tolerance: 5,
        },
      }),
    },
  );

  if (res.status === 429 && retries < MAX_RETRIES) {
    const body = await res.json().catch(() => ({ retry_after: 12 }));
    const wait = (body.retry_after ?? 12) * 1000 + 500;
    await new Promise((r) => setTimeout(r, wait));
    return generate(dataUri, instruction, retries + 1);
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

type Job = { rug: Rug; scene: Scene };

async function processJob(job: Job, idx: number, total: number): Promise<{ ok: boolean; rugId: number; slug: string; reason?: string }> {
  const { rug, scene } = job;
  const outFile = path.join(OUT_DIR, `${rug.id}-${scene.slug}.png`);
  if (!FORCE && (await fileExists(outFile))) {
    console.log(`  [${idx + 1}/${total}] ${rug.id} ${scene.slug.padEnd(14)} skipped (exists)`);
    return { ok: true, rugId: rug.id, slug: scene.slug, reason: "exists" };
  }
  const rugPhoto = path.join(RUGS_DIR, `${rug.id}.jpg`);
  if (!(await fileExists(rugPhoto))) {
    console.warn(`  [${idx + 1}/${total}] ${rug.id} ${scene.slug.padEnd(14)} SKIP (no rug photo)`);
    return { ok: false, rugId: rug.id, slug: scene.slug, reason: "no rug photo" };
  }
  const rugBuf = await readFile(rugPhoto);
  const dataUri = `data:image/jpeg;base64,${rugBuf.toString("base64")}`;
  try {
    const url = await generate(dataUri, scene.instruction);
    const ab = (await (await fetch(url)).arrayBuffer()) as ArrayBuffer;
    const buf = Buffer.from(ab);
    await writeFile(outFile, buf);
    console.log(`  [${idx + 1}/${total}] ${rug.id} ${scene.slug.padEnd(14)} → ${outFile.replace(process.cwd(), ".")} (${(buf.length / 1024).toFixed(0)} KB)`);
    return { ok: true, rugId: rug.id, slug: scene.slug };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  [${idx + 1}/${total}] ${rug.id} ${scene.slug.padEnd(14)} FAILED: ${msg}`);
    return { ok: false, rugId: rug.id, slug: scene.slug, reason: msg };
  }
}

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
  await mkdir(OUT_DIR, { recursive: true });
  const seeds: Rug[] = JSON.parse(await readFile(SEEDS, "utf8"));
  const targetRugs = ONLY_IDS ? seeds.filter((r) => ONLY_IDS.has(String(r.id))) : seeds;

  // Cross-product of rugs × scenes.
  const jobs: Job[] = [];
  for (const rug of targetRugs) {
    for (const scene of SCENES) jobs.push({ rug, scene });
  }
  console.log(`Generating ${jobs.length} lifestyle images (${targetRugs.length} rugs × ${SCENES.length} scenes, concurrency ${CONCURRENCY}${FORCE ? ", force" : ""})…\n`);

  const results = await pool(jobs, CONCURRENCY, (job, i) => processJob(job, i, jobs.length));

  // Patch each rug's `lifestyle` array based on which files now exist on disk.
  let patched = 0;
  for (const seed of seeds) {
    const lifestyle: { slug: string; label: string; src: string }[] = [];
    for (const scene of SCENES) {
      const expected = path.join(OUT_DIR, `${seed.id}-${scene.slug}.png`);
      if (await fileExists(expected)) {
        lifestyle.push({
          slug: scene.slug,
          label: scene.label,
          src: `/rugs/lifestyle/${seed.id}-${scene.slug}.png`,
        });
      }
    }
    const prev = JSON.stringify(seed.lifestyle ?? []);
    const next = JSON.stringify(lifestyle);
    if (lifestyle.length > 0 && prev !== next) {
      seed.lifestyle = lifestyle;
      patched++;
    }
  }
  if (patched > 0) {
    await writeFile(SEEDS, JSON.stringify(seeds, null, 2));
    console.log(`\nPatched ${patched} seed(s) with lifestyle arrays.`);
  }

  const ok = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\nDone. ${ok}/${results.length} succeeded.`);
  if (failed.length > 0) {
    console.log(`Failed (${failed.length}): ${failed.slice(0, 8).map((f) => `${f.rugId}/${f.slug}`).join(", ")}${failed.length > 8 ? " …" : ""}`);
    console.log(`Re-run to retry — the script skips ones that already wrote a file.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
