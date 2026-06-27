/**
 * One-off demo: take our bedroom photo, generate a floor mask from the room's
 * placement quadrilateral, and ask Replicate to inpaint a Persian rug into
 * that area via ControlNet. Save the resulting composite so we can compare it
 * side-by-side with our CSS-projected v0.
 *
 * Requires REPLICATE_API_TOKEN in .env.local (or the environment).
 *
 * Run with: node scripts/controlnet-demo.mjs
 * Output:   scripts/shots/controlnet-bedroom-{1..3}.png
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { config } from "dotenv";
import sharp from "sharp";
import path from "node:path";

config({ path: ".env.local" });

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN not set. Add it to .env.local and re-run.");
  process.exit(1);
}

// Bedroom photo at intrinsic 3800x2533. The placement quad we use in
// lib/visualizer/rooms.ts for the rug area.
const ROOM_PATH = "public/visualizer/rooms/bedroom.jpg";
const PLACEMENT = {
  topLeft: [1300, 1750],
  topRight: [2800, 1750],
  bottomRight: [3400, 2480],
  bottomLeft: [500, 2480],
};

// Resize target — ControlNet works best around 1024px on the long edge.
const TARGET_LONG_EDGE = 1024;

const PROMPTS = [
  "an antique Persian Heriz rug on the wood floor, deep madder red and indigo, hand-knotted, centered medallion, intricate floral border, realistic, photorealistic interior photography, soft natural light",
  "a tribal Caucasian Kazak rug on the wood floor, ivory ground with crimson rosettes, geometric medallions, hand-knotted wool, photorealistic, natural lighting",
  "a contemporary Moroccan Beni Ourain rug on the wood floor, ivory cream wool with charcoal black diamond pattern, plush long pile, photorealistic interior photo",
];

async function buildInputs() {
  const buf = await readFile(ROOM_PATH);
  const meta = await sharp(buf).metadata();
  const scale = TARGET_LONG_EDGE / Math.max(meta.width, meta.height);
  const W = Math.round(meta.width * scale);
  const H = Math.round(meta.height * scale);

  // Resize the room photo.
  const roomBuf = await sharp(buf).resize(W, H).png().toBuffer();

  // Build a binary mask: white inside the placement quad (where to inpaint),
  // black everywhere else. Draw via SVG and rasterize with sharp.
  const sx = scale;
  const polygon = [
    PLACEMENT.topLeft,
    PLACEMENT.topRight,
    PLACEMENT.bottomRight,
    PLACEMENT.bottomLeft,
  ]
    .map(([x, y]) => `${x * sx},${y * sx}`)
    .join(" ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="black"/>
    <polygon points="${polygon}" fill="white"/>
  </svg>`;
  const maskBuf = await sharp(Buffer.from(svg)).png().toBuffer();

  // Persist both to disk so we can verify the mask aligns with the floor
  // before paying for renders we can't interpret.
  await mkdir("scripts/shots", { recursive: true });
  await writeFile("scripts/shots/controlnet-room.png", roomBuf);
  await writeFile("scripts/shots/controlnet-mask.png", maskBuf);

  const roomB64 = `data:image/png;base64,${roomBuf.toString("base64")}`;
  const maskB64 = `data:image/png;base64,${maskBuf.toString("base64")}`;
  return { roomB64, maskB64, W, H };
}

async function runReplicate(input) {
  // Use Stability AI's SDXL inpainting model — well-supported, decent quality,
  // fast (~10–20s). Replicate version pin for stability.
  const VERSION = "lucataco/sdxl-inpainting:a5b13068cc81a89a4fbeefeccc774869fcb34df4dbc92c1555e0f2771d49dde7";
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: VERSION.split(":")[1],
      input,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`replicate create failed: ${res.status} ${text}`);
  }
  let prediction = await res.json();
  while (prediction.status !== "succeeded" && prediction.status !== "failed") {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(prediction.urls.get, {
      headers: { Authorization: `Token ${TOKEN}` },
    });
    prediction = await poll.json();
    process.stdout.write(".");
  }
  process.stdout.write("\n");
  if (prediction.status === "failed") {
    throw new Error(`prediction failed: ${prediction.error}`);
  }
  return prediction.output;
}

async function main() {
  await mkdir("scripts/shots", { recursive: true });
  console.log("Building room + mask inputs …");
  const { roomB64, maskB64, W, H } = await buildInputs();
  console.log(`Room ${W}x${H} ready, mask polygon ready.`);

  for (let i = 0; i < PROMPTS.length; i++) {
    if (i > 0) {
      // Replicate throttles to 6 req/min (1-burst) while balance < $5.
      console.log("Waiting 12s to respect rate limit …");
      await new Promise((r) => setTimeout(r, 12000));
    }
    const prompt = PROMPTS[i];
    console.log(`\n[${i + 1}/${PROMPTS.length}] prompt: ${prompt.slice(0, 80)}…`);
    const output = await runReplicate({
      image: roomB64,
      mask: maskB64,
      prompt,
      negative_prompt: "blurry, low quality, distorted, modern furniture, oversaturated, watermark, signature",
      steps: 30,
      guidance_scale: 8,
      strength: 0.99,
    });
    const url = Array.isArray(output) ? output[0] : output;
    if (!url) {
      console.warn("  no output URL");
      continue;
    }
    const img = await fetch(url).then((r) => r.arrayBuffer());
    const out = path.join("scripts", "shots", `controlnet-bedroom-${i + 1}.png`);
    await writeFile(out, Buffer.from(img));
    console.log(`  → ${out}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
