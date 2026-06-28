/**
 * Verify every rug GLB embeds the rug's real-world dimensions in meters.
 *
 * The 3D viewer scales to the GLB's own coordinates, so if the embedded plane
 * matches widthCm x lengthCm, model-viewer renders the rug at correct size
 * automatically. This script reads each GLB's vertex positions, computes the
 * X/Z extent, and compares it to the seed's `size` string (e.g. `12'0" x 13'0"`).
 *
 *   pnpm tsx scripts/verify-glb-sizes.ts            # full catalog
 *   pnpm tsx scripts/verify-glb-sizes.ts 17600 23000  # subset by id
 *
 * Pass criterion: each axis within 1% of the seed's dimensions.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";

const SEEDS_PATH = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const TOLERANCE = 0.01; // 1%
const FT_TO_M = 0.3048;

/** Parse "12'0\" × 13'0\"" (or with primes/doubles) into [widthFt, lengthFt] decimals. */
function parseSize(size: string): [number, number] | null {
  const cleaned = size
    .replace(/[′’]/g, "'") // ′ ’ → '
    .replace(/[″”]/g, '"') // ″ ” → "
    .replace(/\s+/g, "");
  const m = cleaned.match(/^(\d+)'(\d+)"?[xX×](\d+)'(\d+)"?$/);
  if (!m) return null;
  const [, wFt, wIn, lFt, lIn] = m;
  return [parseInt(wFt) + parseInt(wIn) / 12, parseInt(lFt) + parseInt(lIn) / 12];
}

async function getPlaneExtents(glbPath: string): Promise<{ x: number; y: number; z: number }> {
  const io = new NodeIO();
  const doc = await io.read(glbPath);
  const mesh = doc.getRoot().listMeshes()[0];
  if (!mesh) throw new Error("no mesh");
  const prim = mesh.listPrimitives()[0];
  if (!prim) throw new Error("no primitive");
  const pos = prim.getAttribute("POSITION");
  if (!pos) throw new Error("no POSITION accessor");
  const arr = pos.getArray();
  if (!arr) throw new Error("empty POSITION array");
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < arr.length; i += 3) {
    const x = arr[i], y = arr[i + 1], z = arr[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  return { x: maxX - minX, y: maxY - minY, z: maxZ - minZ };
}

type Seed = { id: number; size: string };

async function main() {
  const subset = process.argv.slice(2);
  const seeds = JSON.parse(await readFile(SEEDS_PATH, "utf8")) as Seed[];
  const target = subset.length
    ? seeds.filter((s) => subset.includes(String(s.id)))
    : seeds;

  let pass = 0;
  let fail = 0;
  let skip = 0;
  const failures: string[] = [];

  for (const seed of target) {
    const glbPath = path.join(RUGS_DIR, `${seed.id}.glb`);
    if (!existsSync(glbPath)) {
      console.log(`  ${seed.id}: SKIP — no GLB`);
      skip++;
      continue;
    }
    const parsed = parseSize(seed.size);
    if (!parsed) {
      console.log(`  ${seed.id}: FAIL — could not parse size "${seed.size}"`);
      fail++;
      failures.push(`${seed.id}: unparseable size "${seed.size}"`);
      continue;
    }
    const [widthFt, lengthFt] = parsed;
    const expectedW = widthFt * FT_TO_M;
    const expectedL = lengthFt * FT_TO_M;
    const ext = await getPlaneExtents(glbPath);

    const dW = Math.abs(ext.x - expectedW) / expectedW;
    const dL = Math.abs(ext.z - expectedL) / expectedL;
    const ok = dW <= TOLERANCE && dL <= TOLERANCE && ext.y < 0.01; // plane should be flat

    if (ok) {
      console.log(
        `  ${seed.id}: PASS · ${widthFt.toFixed(2)}'×${lengthFt.toFixed(2)}' (${expectedW.toFixed(3)}×${expectedL.toFixed(3)} m) → GLB ${ext.x.toFixed(3)}×${ext.z.toFixed(3)} m`,
      );
      pass++;
    } else {
      const msg = `${seed.id}: expected ${expectedW.toFixed(3)}×${expectedL.toFixed(3)} m, got ${ext.x.toFixed(3)}×${ext.z.toFixed(3)} m (ΔW ${(dW * 100).toFixed(2)}%, ΔL ${(dL * 100).toFixed(2)}%, Y extent ${ext.y.toFixed(3)})`;
      console.log(`  ${seed.id}: FAIL — ${msg}`);
      fail++;
      failures.push(msg);
    }
  }

  console.log(`\nDone. ${pass} pass · ${fail} fail · ${skip} skip (of ${target.length} targets).`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  ${f}`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
