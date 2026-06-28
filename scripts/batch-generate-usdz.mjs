/**
 * Batch-convert every .glb in public/rugs/ to .usdz for iOS Quick Look AR.
 * Skips rugs whose .usdz already exists (re-runnable). Updates
 * lib/catalog/new-fixture-seeds.json with model3dUsdzUrl for each
 * successfully-converted rug.
 *
 *   node scripts/batch-generate-usdz.mjs
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const SEEDS_PATH = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");

function convertOne(glbPath, usdzPath) {
  return new Promise((resolve) => {
    // No shell: on Windows, shell:true routes through cmd.exe without quoting
    // the args, and our paths contain spaces ("OneDrive\Desktop\Isberian new
    // site\..."). Spawning python directly uses CreateProcessW which handles
    // spaces correctly.
    const child = spawn("python", ["scripts/glb-to-usdz.py", glbPath, usdzPath], {
      stdio: "pipe",
    });
    let out = "";
    child.stdout.on("data", (d) => { out += d.toString(); });
    child.stderr.on("data", (d) => { out += d.toString(); });
    child.on("exit", (code) => resolve({ code, out: out.trim() }));
  });
}

const CONCURRENCY = 5;

async function main() {
  const files = await readdir(RUGS_DIR);
  const glbs = files
    .filter((f) => /^\d+\.glb$/.test(f))
    .map((f) => f.replace(/\.glb$/, ""));
  console.log(`Found ${glbs.length} GLBs. Converting to USDZ (concurrency ${CONCURRENCY})…\n`);

  const todo = glbs.filter((id) => !existsSync(path.join(RUGS_DIR, `${id}.usdz`)));
  const skipped = glbs.filter((id) => existsSync(path.join(RUGS_DIR, `${id}.usdz`)));
  console.log(`  ${todo.length} to convert · ${skipped.length} already exist\n`);

  const converted = [];
  const failed = [];
  let done = 0;

  // Process in batches of CONCURRENCY.
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (id) => {
        const glbPath = path.join(RUGS_DIR, `${id}.glb`);
        const usdzPath = path.join(RUGS_DIR, `${id}.usdz`);
        const r = await convertOne(glbPath, usdzPath);
        return { id, ...r };
      }),
    );
    for (const r of results) {
      done++;
      if (r.code === 0) {
        converted.push(r.id);
        console.log(`  [${done}/${todo.length}] ${r.id}: ${r.out.split("\n").pop().trim()}`);
      } else {
        failed.push({ id: r.id, out: r.out.slice(0, 200) });
        console.log(`  [${done}/${todo.length}] ${r.id}: FAILED — ${r.out.slice(0, 120)}`);
      }
    }
  }

  // Update seeds with model3dUsdzUrl.
  const seeds = JSON.parse(await readFile(SEEDS_PATH, "utf8"));
  const have = new Set([...converted, ...skipped]);
  for (const seed of seeds) {
    if (have.has(String(seed.id))) {
      seed.model3dUsdzUrl = `/rugs/${seed.id}.usdz`;
    }
  }
  await writeFile(SEEDS_PATH, JSON.stringify(seeds, null, 2));

  console.log(`\nDone. Converted ${converted.length} · Skipped ${skipped.length} · Failed ${failed.length}.`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) console.log(`  ${f.id}: ${f.out}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
