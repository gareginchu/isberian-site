/**
 * One-rug feasibility test for the v1 pipeline — generate four "lifestyle"
 * scenes that show the REAL rug photo on the floor of an AI-generated room.
 *
 * Strategy: Flux Kontext Pro on Replicate (image-to-image with strong
 * identity preservation). Feeds the rug's top-down photo as the conditioning
 * image and asks Kontext to render it placed on a floor in a specific room
 * style. If the rug pattern survives the perspective shift, this is the
 * pipeline. If not, we fall back to: generate empty-floor room → Claude
 * vision finds the floor quad → perspective-warp the rug onto it.
 *
 *   pnpm tsx scripts/rug-in-rooms-test.ts [rug-id]   # default 17600
 *
 * Saves: scripts/shots/rooms/kontext/<rug-id>__<scene-slug>.png
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN not set");
  process.exit(1);
}

const SEEDS = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
const OUT_DIR = path.resolve(process.cwd(), "scripts", "shots", "rooms", "kontext");

const SCENES = [
  {
    slug: "library",
    instruction:
      "Place this exact rug on the hardwood floor of a traditional gentleman's library. Walnut wainscoting, leather-bound books on built-in shelves, a deep wing chair angled toward the rug, late afternoon golden-hour light through tall windows. Eye-level photograph from a comfortable seated angle. Preserve the rug's pattern, colors, and proportions exactly.",
  },
  {
    slug: "modern-living",
    instruction:
      "Place this exact rug on the floor of a minimal contemporary living room. White plaster walls, raw oak floor, low sectional sofa in oatmeal linen, a marble coffee table. Soft north-facing daylight. Eye-level photograph. Preserve the rug's pattern, colors, and proportions exactly.",
  },
  {
    slug: "dining",
    instruction:
      "Place this exact rug under a polished walnut dining table with six upholstered chairs in a formal dining room. Brass chandelier overhead, lime-washed plaster walls, large windows with linen curtains. Eye-level photograph from one end of the table. Preserve the rug's pattern, colors, and proportions exactly.",
  },
  {
    slug: "bedroom",
    instruction:
      "Place this exact rug at the foot of a bed in a calm, restrained bedroom. Linen-upholstered headboard, walnut nightstands, soft morning light through sheer curtains. Eye-level photograph. Preserve the rug's pattern, colors, and proportions exactly.",
  },
];

async function generate(rugDataUri: string, instruction: string): Promise<string> {
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
          input_image: rugDataUri,
          prompt: instruction,
          aspect_ratio: "3:2",
          output_format: "png",
          safety_tolerance: 5,
        },
      }),
    },
  );

  if (res.status === 429) {
    const body = await res.json().catch(() => ({ retry_after: 12 }));
    const wait = (body.retry_after ?? 12) * 1000 + 500;
    await new Promise((r) => setTimeout(r, wait));
    return generate(rugDataUri, instruction);
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

async function main() {
  const rugId = process.argv[2] ?? "17600";
  const seeds = JSON.parse(await readFile(SEEDS, "utf8"));
  const rug = seeds.find((r: { id: number }) => String(r.id) === rugId);
  if (!rug) {
    console.error(`rug ${rugId} not in seeds`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  // Encode the local rug photo as a data URI so Replicate can read it without
  // us hosting it anywhere first.
  const rugBuf = await readFile(path.resolve(process.cwd(), "public", "rugs", `${rugId}.jpg`));
  const dataUri = `data:image/jpeg;base64,${rugBuf.toString("base64")}`;

  console.log(`\n→ ${rug.title} (${rug.id})`);
  console.log(`Testing ${SCENES.length} room scenes with Flux Kontext Pro…\n`);

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i]!;
    if (i > 0) {
      process.stdout.write("  (waiting 12s for rate limit) ");
      await new Promise((r) => setTimeout(r, 12000));
    }
    try {
      const url = await generate(dataUri, scene.instruction);
      const ab = (await (await fetch(url)).arrayBuffer()) as ArrayBuffer;
      const buf = Buffer.from(ab);
      const out = path.join(OUT_DIR, `${rugId}__${scene.slug}.png`);
      await writeFile(out, buf);
      console.log(`  ${scene.slug.padEnd(14)} → ${out.replace(process.cwd(), ".")} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.warn(`  ${scene.slug.padEnd(14)} FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
