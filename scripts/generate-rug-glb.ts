/**
 * Generate a .glb (binary glTF) 3D model for a single rug: a textured plane
 * sized to the rug's real-world dimensions so AR placement scale is correct.
 *
 * The plane lies flat on the floor (XZ plane, Y-up). The rug photo becomes the
 * baseColor texture; for v0 we skip alpha masking and normal-mapping (those
 * are real-photography-pass upgrades).
 *
 *   pnpm tsx scripts/generate-rug-glb.ts <rugId> [<widthFt> <lengthFt>]
 *   pnpm tsx scripts/generate-rug-glb.ts 71750 9 12
 *
 * Reads:  public/rugs/<id>.jpg
 * Writes: public/rugs/<id>.glb
 */
import { Document, NodeIO } from "@gltf-transform/core";
import { readFile } from "node:fs/promises";
import path from "node:path";

const FT_TO_M = 0.3048;

async function main() {
  const [idArg, wArg, lArg] = process.argv.slice(2);
  if (!idArg) {
    console.error("Usage: pnpm tsx scripts/generate-rug-glb.ts <id> <widthFt> <lengthFt>");
    process.exit(1);
  }
  const id = idArg;
  const widthFt = parseFloat(wArg ?? "9");
  const lengthFt = parseFloat(lArg ?? "12");
  const widthM = widthFt * FT_TO_M;
  const lengthM = lengthFt * FT_TO_M;

  const imgPath = path.resolve(process.cwd(), "public", "rugs", `${id}.jpg`);
  const outPath = path.resolve(process.cwd(), "public", "rugs", `${id}.glb`);
  const imgBuf = await readFile(imgPath);

  const doc = new Document();
  const buf = doc.createBuffer();

  // Rectangular plane in the XZ plane, Y-up. Width = X, length = Z.
  const halfW = widthM / 2;
  const halfL = lengthM / 2;
  const positions = new Float32Array([
    -halfW, 0, -halfL,
     halfW, 0, -halfL,
     halfW, 0,  halfL,
    -halfW, 0,  halfL,
  ]);
  // UVs map the rug photo onto the plane top-down. (0,0) is upper-left of
  // texture; we flip V so the rug photo orientation reads correctly when
  // viewed from above.
  const uvs = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    0, 1,
  ]);
  // All four vertices share the up-facing normal.
  const normals = new Float32Array([
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
  ]);
  // Two triangles, CCW when viewed from above.
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const positionAcc = doc.createAccessor()
    .setType("VEC3")
    .setArray(positions)
    .setBuffer(buf);
  const uvAcc = doc.createAccessor()
    .setType("VEC2")
    .setArray(uvs)
    .setBuffer(buf);
  const normalAcc = doc.createAccessor()
    .setType("VEC3")
    .setArray(normals)
    .setBuffer(buf);
  const indexAcc = doc.createAccessor()
    .setType("SCALAR")
    .setArray(indices)
    .setBuffer(buf);

  const texture = doc.createTexture()
    .setImage(imgBuf)
    .setMimeType("image/jpeg")
    .setName(`rug-${id}`);

  const material = doc.createMaterial()
    .setName(`rug-${id}-mat`)
    .setBaseColorTexture(texture)
    .setRoughnessFactor(0.85)
    .setMetallicFactor(0)
    .setDoubleSided(true);

  const prim = doc.createPrimitive()
    .setIndices(indexAcc)
    .setAttribute("POSITION", positionAcc)
    .setAttribute("TEXCOORD_0", uvAcc)
    .setAttribute("NORMAL", normalAcc)
    .setMaterial(material);

  const mesh = doc.createMesh().addPrimitive(prim);
  const node = doc.createNode(`rug-${id}`).setMesh(mesh);
  doc.createScene("scene").addChild(node);

  const io = new NodeIO();
  await io.write(outPath, doc);

  const stats = await import("node:fs/promises").then((m) => m.stat(outPath));
  console.log(
    `Wrote ${outPath} (${(stats.size / 1024).toFixed(0)} KB) — ${widthFt}'×${lengthFt}' = ${widthM.toFixed(2)}m × ${lengthM.toFixed(2)}m`,
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
