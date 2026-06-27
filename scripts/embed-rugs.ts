/**
 * One-time offline job: embed every rug image with CLIP (Transformers.js) and
 * save the resulting 512-dim vectors to lib/similarity/embeddings.json. The
 * server uses those vectors at query time to compute cosine similarity — no
 * model needs to run on Vercel.
 *
 * Run with:  pnpm tsx scripts/embed-rugs.ts
 *
 * Output:    lib/similarity/embeddings.json
 *              { rugId: number[512] }
 *
 * First run downloads the CLIP ViT-B/32 model (~150 MB) into the local
 * Transformers.js cache. Subsequent runs are fast.
 */

import { pipeline, env, AutoProcessor, RawImage, CLIPVisionModelWithProjection } from "@xenova/transformers";
import { listRugs } from "@/lib/catalog";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Use the local public/ tree as the image source.
env.allowLocalModels = true;
env.useBrowserCache = false;

const MODEL_ID = "Xenova/clip-vit-base-patch32";
const OUT = path.resolve(process.cwd(), "lib", "similarity", "embeddings.json");

async function main() {
  console.log(`Loading CLIP model (${MODEL_ID}) …`);
  const processor = await AutoProcessor.from_pretrained(MODEL_ID);
  const model = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID);
  console.log("Model loaded.");

  const rugs = await listRugs();
  console.log(`Embedding ${rugs.length} rugs.`);

  const embeddings: Record<string, number[]> = {};

  for (let i = 0; i < rugs.length; i++) {
    const rug = rugs[i];
    const img = rug.images.find((x) => x.primary) ?? rug.images[0];
    if (!img) {
      console.warn(`  [${i + 1}/${rugs.length}] ${rug.id}: no image, skipping.`);
      continue;
    }

    // rug images live under /public/rugs/<id>.jpg (or wherever); resolve to disk path.
    const relPath = img.src.startsWith("/") ? img.src.slice(1) : img.src;
    const absPath = path.resolve(process.cwd(), "public", relPath.replace(/^public\//, ""));

    try {
      const fileBuf = await readFile(absPath);
      // RawImage.fromBlob handles JPEG decoding via sharp internally.
      const blob = new Blob([fileBuf], { type: "image/jpeg" });
      const image = await RawImage.fromBlob(blob);
      const inputs = await processor(image);
      const output = await model(inputs);
      // image_embeds is a Tensor with shape [1, 512]. Pull the first row.
      const vec = Array.from(output.image_embeds.data as Float32Array);
      // L2-normalize so cosine similarity is just a dot product later.
      const norm = Math.hypot(...vec);
      const unit = vec.map((v) => v / norm);
      embeddings[rug.id] = unit;
      console.log(`  [${i + 1}/${rugs.length}] ${rug.id}: ok (dim ${unit.length})`);
    } catch (err) {
      console.warn(
        `  [${i + 1}/${rugs.length}] ${rug.id}: failed — ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(embeddings));
  console.log(`Wrote ${Object.keys(embeddings).length} embeddings to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
