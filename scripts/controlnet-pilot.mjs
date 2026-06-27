/**
 * ControlNet pilot — 5 catalog rugs × 3 rooms = 15 composites. Generates
 * a sample grid Isberian can review before committing to the photography
 * pass + full pre-render.
 *
 * Realism approach v0: SDXL Inpainting with rich prompts derived from each
 * rug's structured RugDescription (colorPalette, designFeatures, origin).
 * NOT true IP-Adapter (the reference-image conditioning) — that's the
 * production-pipeline upgrade. This pilot establishes the lower-bound
 * quality so we can see what prompt-driven AI inpainting looks like across
 * the catalog without spending on the more expensive reference path.
 *
 *   node scripts/controlnet-pilot.mjs
 * Output: scripts/shots/pilot/<room-slug>__<rug-id>.png
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { config } from "dotenv";
import sharp from "sharp";
import path from "node:path";
config({ path: ".env.local" });

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN not set");
  process.exit(1);
}

// 5 representative rugs from the catalog — span the diversity.
const RUGS = [
  { id: "17109", title: "Imperial Medallion Kazak (1888)", prompt: "antique Caucasian Kazak rug, deep madder red field, indigo medallion, undyed ivory accents, yellow ochre highlights, central imperial medallion, stepped spandrels, running-dog border, hand-knotted wool, photorealistic" },
  { id: "78529", title: "Persian Prayer Niche", prompt: "antique Persian prayer rug, deep brown field, brick red border, mihrab niche with hanging lamp motif, geometric medallions, ivory script cartouche, hand-knotted wool, photorealistic" },
  { id: "88834", title: "Contemporary Distressed Teal", prompt: "contemporary distressed overdyed rug, deep teal and black tonal field, blurred herringbone pattern, modern industrial aesthetic, hand-knotted, photorealistic" },
  { id: "89134", title: "Caucasian Multi-Stripe Runner", prompt: "long narrow Caucasian runner, vertical stripes of madder red and slate blue, ivory minor borders, repeating cruciform and star motifs, hand-knotted wool, photorealistic" },
  { id: "88889", title: "Contemporary Grey Shag", prompt: "contemporary shag rug, plush pale grey wool pile, long fibers flowing naturally, soft modern texture, photorealistic" },
];

// 3 rooms with placement quads (matches lib/visualizer/rooms.ts).
const ROOMS = [
  {
    slug: "bedroom",
    src: "public/visualizer/rooms/bedroom.jpg",
    placement: { topLeft: [1300, 1750], topRight: [2800, 1750], bottomRight: [3400, 2480], bottomLeft: [500, 2480] },
  },
  {
    slug: "foyer",
    src: "public/visualizer/rooms/foyer.jpg",
    placement: { topLeft: [950, 1850], topRight: [1620, 1850], bottomRight: [2100, 3450], bottomLeft: [480, 3450] },
  },
  {
    slug: "living-modern",
    src: "public/visualizer/rooms/living-modern.jpg",
    placement: { topLeft: [400, 2400], topRight: [2700, 2400], bottomRight: [2950, 4400], bottomLeft: [50, 4400] },
  },
];

const TARGET_LONG_EDGE = 1024;
const NEGATIVE = "blurry, low quality, distorted, modern furniture, oversaturated, watermark, signature, AI-generated text, text, label";
const MODEL_VERSION = "a5b13068cc81a89a4fbeefeccc774869fcb34df4dbc92c1555e0f2771d49dde7"; // lucataco/sdxl-inpainting

async function buildInputs(room) {
  const buf = await readFile(room.src);
  const meta = await sharp(buf).metadata();
  const scale = TARGET_LONG_EDGE / Math.max(meta.width, meta.height);
  const W = Math.round(meta.width * scale);
  const H = Math.round(meta.height * scale);
  const roomBuf = await sharp(buf).resize(W, H).png().toBuffer();
  const sx = scale;
  const polygon = [room.placement.topLeft, room.placement.topRight, room.placement.bottomRight, room.placement.bottomLeft]
    .map(([x, y]) => `${x * sx},${y * sx}`).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="black"/>
    <polygon points="${polygon}" fill="white"/>
  </svg>`;
  const maskBuf = await sharp(Buffer.from(svg)).png().toBuffer();
  return {
    image: `data:image/png;base64,${roomBuf.toString("base64")}`,
    mask: `data:image/png;base64,${maskBuf.toString("base64")}`,
  };
}

async function predict(input) {
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: { Authorization: `Token ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ version: MODEL_VERSION, input }),
  });
  if (!res.ok) throw new Error(`replicate ${res.status}: ${await res.text()}`);
  let prediction = await res.json();
  while (prediction.status !== "succeeded" && prediction.status !== "failed") {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(prediction.urls.get, { headers: { Authorization: `Token ${TOKEN}` } });
    prediction = await poll.json();
    process.stdout.write(".");
  }
  process.stdout.write("\n");
  if (prediction.status === "failed") throw new Error(prediction.error);
  return prediction.output;
}

async function main() {
  await mkdir("scripts/shots/pilot", { recursive: true });
  const total = ROOMS.length * RUGS.length;
  let i = 0;
  for (const room of ROOMS) {
    console.log(`\n=== Room: ${room.slug}`);
    const { image, mask } = await buildInputs(room);
    for (const rug of RUGS) {
      i++;
      const outFile = path.join("scripts/shots/pilot", `${room.slug}__${rug.id}.png`);
      console.log(`[${i}/${total}] ${rug.title} → ${room.slug}`);
      try {
        // Throttle to respect Replicate's 6 req/min limit under $5 balance.
        if (i > 1) {
          process.stdout.write("  waiting 12s for rate limit …\n");
          await new Promise((r) => setTimeout(r, 12000));
        }
        const out = await predict({
          image,
          mask,
          prompt: `${rug.prompt}, photographic interior shot, natural lighting, on the floor`,
          negative_prompt: NEGATIVE,
          steps: 30,
          guidance_scale: 8.5,
          strength: 0.99,
        });
        const url = Array.isArray(out) ? out[0] : out;
        if (!url) { console.warn("  no output url"); continue; }
        const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
        await writeFile(outFile, buf);
        console.log(`  → ${outFile} (${(buf.length / 1024).toFixed(0)} KB)`);
      } catch (e) {
        console.warn(`  ${rug.id} × ${room.slug}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }
  console.log(`\nDone. ${total} composites attempted.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
