/**
 * Generate a .glb 3D model for a rug as a textured plane sized to the rug's
 * real-world dimensions. Optional passes for higher realism:
 *
 *   --mask    Apply color-based alpha mask (auto-detect background from
 *             corner pixels). Removes white/cream studio margins so the
 *             rug shape is its actual outline in 3D / AR.
 *   --normal  Generate + apply a normal map from the rug photo's luminance
 *             gradient (Sobel). Gives the plane a pile-depth illusion when
 *             viewed at an oblique angle (the AR / walking-by view).
 *
 *   pnpm tsx scripts/generate-rug-glb.ts <id> <widthFt> <lengthFt> [--mask] [--normal]
 *   pnpm tsx scripts/generate-rug-glb.ts 71750 9 12 --mask --normal
 *
 * Reads:  public/rugs/<id>.jpg
 * Writes: public/rugs/<id>.glb
 */
import { Document, NodeIO } from "@gltf-transform/core";
import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const FT_TO_M = 0.3048;

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const positional = args.filter((a) => !a.startsWith("--"));
  return {
    id: positional[0],
    widthFt: parseFloat(positional[1] ?? "9"),
    lengthFt: parseFloat(positional[2] ?? "12"),
    mask: flags.has("--mask"),
    normal: flags.has("--normal"),
  };
}

/**
 * Color-based alpha mask. Samples the four corner pixels and treats the
 * dominant light color as the background. Any pixel within `tolerance` of
 * the background's RGB goes transparent. Crude — SAM2 would be better — but
 * fast and zero-cost.
 */
async function buildAlphaMaskedRgba(jpegBuf: Buffer): Promise<Buffer> {
  const img = sharp(jpegBuf);
  const meta = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Sample background color from 4 corners (average them).
  function px(x: number, y: number) {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  }
  const corners = [
    px(0, 0),
    px(width - 1, 0),
    px(0, height - 1),
    px(width - 1, height - 1),
  ];
  const bg = [0, 1, 2].map((c) => corners.reduce((s, p) => s + p[c], 0) / 4);
  const bgLum = (bg[0] + bg[1] + bg[2]) / 3;
  // Only mask if corners are clearly light (background). If corners are dark,
  // the rug fills the whole frame; skip masking to be safe.
  if (bgLum < 200) {
    return await sharp(jpegBuf).ensureAlpha().toFormat("png").toBuffer();
  }
  const tolerance = 30; // RGB distance squared / 3
  const masked = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const d = Math.sqrt(
      (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2,
    );
    masked[j] = r;
    masked[j + 1] = g;
    masked[j + 2] = b;
    // Smooth-step: fully transparent at d=0, fully opaque at d>=tolerance.
    masked[j + 3] = d >= tolerance ? 255 : Math.round((d / tolerance) * 255);
  }
  return await sharp(masked, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}

/**
 * Normal map from a rug photo. Convert to grayscale, compute Sobel gradients,
 * encode as a tangent-space normal map (R = dx, G = dy, B = up).
 */
async function buildNormalMap(jpegBuf: Buffer): Promise<Buffer> {
  // Sharp's built-in convolve makes this cheap. Two passes: horizontal Sobel,
  // vertical Sobel. Then combine.
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  const grayBuf = await sharp(jpegBuf).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = grayBuf.info;
  const gray = grayBuf.data;

  // Manual Sobel — sharp can do convolution but signed-int output is awkward.
  // For each interior pixel, compute dx + dy from the 3x3 neighborhood.
  const out = Buffer.alloc(width * height * 3);
  const strength = 0.65; // 0..1, how pronounced the bumps look
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      let gx = 0, gy = 0;
      // Edge pixels: just use the up-vector. Skip Sobel.
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const k = (ky + 1) * 3 + (kx + 1);
            const px = gray[(y + ky) * width + (x + kx)];
            gx += sobelX[k] * px;
            gy += sobelY[k] * px;
          }
        }
        gx /= 1020; // normalize: 4 * 255 = 1020 max
        gy /= 1020;
        gx *= strength;
        gy *= strength;
      }
      // Encode: R = (gx + 1)/2, G = (-gy + 1)/2 (image y-down → normal y-up), B = up
      const o = i * 3;
      out[o] = Math.max(0, Math.min(255, Math.round(((gx + 1) / 2) * 255)));
      out[o + 1] = Math.max(0, Math.min(255, Math.round(((-gy + 1) / 2) * 255)));
      // Compute Z so the normal vector is unit-length-ish. Simpler approximation: 200 (flat-leaning)
      const z = Math.sqrt(Math.max(0, 1 - gx * gx - gy * gy));
      out[o + 2] = Math.max(0, Math.min(255, Math.round(((z + 1) / 2) * 255)));
    }
  }
  return await sharp(out, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();
}

async function main() {
  const args = parseArgs();
  if (!args.id) {
    console.error("Usage: pnpm tsx scripts/generate-rug-glb.ts <id> <widthFt> <lengthFt> [--mask] [--normal]");
    process.exit(1);
  }
  const widthM = args.widthFt * FT_TO_M;
  const lengthM = args.lengthFt * FT_TO_M;
  const imgPath = path.resolve(process.cwd(), "public", "rugs", `${args.id}.jpg`);
  const outPath = path.resolve(process.cwd(), "public", "rugs", `${args.id}.glb`);

  const jpegBuf = await readFile(imgPath);

  // Base color texture: with mask if requested.
  let colorBuf: Buffer;
  let colorMime = "image/jpeg";
  if (args.mask) {
    colorBuf = await buildAlphaMaskedRgba(jpegBuf);
    colorMime = "image/png";
  } else {
    colorBuf = jpegBuf;
  }
  // Normal map if requested.
  let normalBuf: Buffer | null = null;
  if (args.normal) normalBuf = await buildNormalMap(jpegBuf);

  const doc = new Document();
  const buf = doc.createBuffer();

  const halfW = widthM / 2;
  const halfL = lengthM / 2;
  const positions = new Float32Array([
    -halfW, 0, -halfL,
     halfW, 0, -halfL,
     halfW, 0,  halfL,
    -halfW, 0,  halfL,
  ]);
  const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
  const normals = new Float32Array([
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
  ]);
  // Per-vertex tangents (needed for normal mapping).
  const tangents = new Float32Array([
    1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const accPos = doc.createAccessor().setType("VEC3").setArray(positions).setBuffer(buf);
  const accUv = doc.createAccessor().setType("VEC2").setArray(uvs).setBuffer(buf);
  const accNor = doc.createAccessor().setType("VEC3").setArray(normals).setBuffer(buf);
  const accTan = doc.createAccessor().setType("VEC4").setArray(tangents).setBuffer(buf);
  const accIdx = doc.createAccessor().setType("SCALAR").setArray(indices).setBuffer(buf);

  const colorTex = doc.createTexture()
    .setImage(colorBuf)
    .setMimeType(colorMime)
    .setName(`rug-${args.id}-color`);

  const material = doc.createMaterial()
    .setName(`rug-${args.id}-mat`)
    .setBaseColorTexture(colorTex)
    .setRoughnessFactor(0.85)
    .setMetallicFactor(0)
    .setDoubleSided(true);

  if (args.mask) {
    material.setAlphaMode("MASK").setAlphaCutoff(0.35);
  }
  if (normalBuf) {
    const normalTex = doc.createTexture()
      .setImage(normalBuf)
      .setMimeType("image/png")
      .setName(`rug-${args.id}-normal`);
    material.setNormalTexture(normalTex);
  }

  const prim = doc.createPrimitive()
    .setIndices(accIdx)
    .setAttribute("POSITION", accPos)
    .setAttribute("TEXCOORD_0", accUv)
    .setAttribute("NORMAL", accNor)
    .setAttribute("TANGENT", accTan)
    .setMaterial(material);

  const mesh = doc.createMesh().addPrimitive(prim);
  const node = doc.createNode(`rug-${args.id}`).setMesh(mesh);
  doc.createScene("scene").addChild(node);

  const io = new NodeIO();
  await io.write(outPath, doc);

  const s = await stat(outPath);
  const opts = [args.mask && "mask", args.normal && "normal"].filter(Boolean).join("+") || "plain";
  console.log(
    `  ${args.id}: ${(s.size / 1024).toFixed(0)} KB · ${args.widthFt}'×${args.lengthFt}' (${widthM.toFixed(2)}×${lengthM.toFixed(2)} m) · ${opts}`,
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
