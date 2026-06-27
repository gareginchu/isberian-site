/**
 * Final cleanup after process-new-rugs.ts:
 *   1. Delete every rug image whose ID is in lib/catalog/rug-fails.json
 *   2. (lib/catalog/new-fixture-seeds.json was already updated by the processor)
 *   3. Re-run CLIP embeddings to cover the final catalog set
 *
 * Run with: node scripts/finalize-catalog.mjs
 */
import { unlink, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const FAILS_PATH = path.resolve(process.cwd(), "lib", "catalog", "rug-fails.json");

async function main() {
  // 1. Delete failed rugs.
  let failedIds: string[] = [];
  try {
    const raw = await readFile(FAILS_PATH, "utf8");
    failedIds = JSON.parse(raw);
  } catch {
    console.warn("No rug-fails.json — skipping delete step.");
  }

  let deleted = 0;
  for (const id of failedIds) {
    const p = path.join(RUGS_DIR, `${id}.jpg`);
    if (existsSync(p)) {
      await unlink(p);
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} failed images.`);

  // 2. Count what's left.
  const remaining = (await readdir(RUGS_DIR)).filter((f) => /^\d+\.jpg$/.test(f));
  console.log(`Remaining rug images: ${remaining.length}`);

  // 3. Re-embed CLIP across the final set.
  console.log(`Running CLIP embedding script…`);
  await new Promise<void>((resolve, reject) => {
    const child = spawn("pnpm", ["tsx", "scripts/embed-rugs.ts"], { stdio: "inherit", shell: true });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`embed-rugs exit ${code}`))));
  });

  console.log(`Done.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
