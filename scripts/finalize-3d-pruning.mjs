/**
 * Reads lib/catalog/rug-3d-audit.json. For every rug that FAILED:
 *   - Deletes public/rugs/<id>.jpg
 *   - Deletes public/rugs/<id>.glb (if present)
 *   - Deletes public/rugs/<id>.usdz (if present)
 *   - Removes its entry from lib/catalog/new-fixture-seeds.json
 *
 * Then re-runs scripts/embed-rugs.ts to regenerate CLIP embeddings over
 * the pruned set.
 */
import { unlink, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const AUDIT_PATH = path.resolve(process.cwd(), "lib", "catalog", "rug-3d-audit.json");
const SEEDS_PATH = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");

async function main() {
  const audit = JSON.parse(await readFile(AUDIT_PATH, "utf8"));
  const failIds = audit.filter((r) => r.fit !== "pass").map((r) => String(r.id));
  console.log(`Pruning ${failIds.length} failed rugs: ${failIds.join(", ")}\n`);

  let deletedFiles = 0;
  for (const id of failIds) {
    for (const ext of ["jpg", "glb", "usdz"]) {
      const p = path.join(RUGS_DIR, `${id}.${ext}`);
      if (existsSync(p)) {
        await unlink(p);
        deletedFiles++;
        console.log(`  deleted ${id}.${ext}`);
      }
    }
  }

  const seeds = JSON.parse(await readFile(SEEDS_PATH, "utf8"));
  const failSet = new Set(failIds);
  const kept = seeds.filter((s) => !failSet.has(String(s.id)));
  await writeFile(SEEDS_PATH, JSON.stringify(kept, null, 2));
  console.log(`\nSeeds: ${seeds.length} → ${kept.length}`);
  console.log(`Files deleted: ${deletedFiles}`);

  console.log(`\nRe-running CLIP embeddings…`);
  await new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["tsx", "scripts/embed-rugs.ts"], { stdio: "inherit", shell: true });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`embed-rugs exit ${code}`))));
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
