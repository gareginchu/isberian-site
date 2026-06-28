/**
 * Batch-generate .glb 3D models for every rug in lib/catalog/new-fixture-seeds.json.
 * Parses each rug's sizeImperial → widthFt × lengthFt and runs generate-rug-glb
 * with alpha mask + normal map options. Updates the seed JSON to add
 * `model3dGlbUrl` for each successfully-generated rug.
 *
 *   node scripts/batch-generate-glbs.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const SEEDS_PATH = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");

function parseSize(s) {
  const m = s.match(/(\d+)'\s*(\d+)?"?\s*[×x]\s*(\d+)'\s*(\d+)?"?/);
  if (!m) return null;
  const w = parseInt(m[1], 10) + (parseInt(m[2] ?? "0", 10) / 12);
  const l = parseInt(m[3], 10) + (parseInt(m[4] ?? "0", 10) / 12);
  return { widthFt: w, lengthFt: l };
}

function runOne(id, widthFt, lengthFt) {
  return new Promise((resolve) => {
    const child = spawn(
      "pnpm",
      ["tsx", "scripts/generate-rug-glb.ts", String(id), String(widthFt.toFixed(2)), String(lengthFt.toFixed(2)), "--mask", "--normal"],
      { stdio: "pipe", shell: true },
    );
    let out = "";
    child.stdout.on("data", (d) => { out += d.toString(); });
    child.stderr.on("data", (d) => { out += d.toString(); });
    child.on("exit", (code) => resolve({ id, code, out: out.trim() }));
  });
}

async function main() {
  const seeds = JSON.parse(await readFile(SEEDS_PATH, "utf8"));
  console.log(`Generating GLBs for ${seeds.length} rugs (with mask + normal)…\n`);

  const generated = [];
  const failed = [];

  // Sequential — sharp + glb writes share state, no real benefit to parallel
  // and avoids load spikes on disk.
  const skipped = [];
  for (const seed of seeds) {
    const jpgPath = path.join(RUGS_DIR, `${seed.id}.jpg`);
    const glbPath = path.join(RUGS_DIR, `${seed.id}.glb`);
    if (existsSync(glbPath)) {
      skipped.push(seed.id);
      continue;
    }
    if (!existsSync(jpgPath)) {
      console.warn(`  ${seed.id}: no jpg, skipping`);
      failed.push({ id: seed.id, reason: "no jpg" });
      continue;
    }
    const size = parseSize(seed.size);
    if (!size) {
      console.warn(`  ${seed.id}: can't parse size "${seed.size}"`);
      failed.push({ id: seed.id, reason: `bad size: ${seed.size}` });
      continue;
    }
    const result = await runOne(seed.id, size.widthFt, size.lengthFt);
    if (result.code === 0) {
      console.log(result.out);
      generated.push(seed.id);
    } else {
      console.warn(`  ${seed.id}: FAILED — ${result.out.slice(0, 200)}`);
      failed.push({ id: seed.id, reason: result.out.slice(0, 200) });
    }
  }

  // Update seeds with model3dGlbUrl. Patch both newly-generated AND previously-
  // existing GLBs so the seed always reflects what's actually on disk.
  for (const seed of seeds) {
    if (generated.includes(seed.id) || skipped.includes(seed.id)) {
      seed.model3dGlbUrl = `/rugs/${seed.id}.glb`;
    }
  }
  await writeFile(SEEDS_PATH, JSON.stringify(seeds, null, 2));

  console.log(`\nDone. Generated ${generated.length} · Skipped ${skipped.length} · Failed ${failed.length} (of ${seeds.length}).`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) console.log(`  ${f.id}: ${f.reason}`);
  }
  console.log(`\nSeeds updated with model3dGlbUrl: ${SEEDS_PATH}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
