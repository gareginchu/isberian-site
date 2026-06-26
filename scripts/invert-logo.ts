/**
 * Invert the brand logo (black on transparent) to white on transparent.
 * Run once: `pnpm tsx scripts/invert-logo.ts` (or `node --import tsx ...`).
 * Output: public/logo-white.png
 *
 * Strategy: read the source PNG with alpha. For every pixel we keep its alpha
 * (so anti-aliased edges stay smooth) but force RGB to 255,255,255. This works
 * cleanly because the source is monochrome black art on a transparent canvas.
 */
import sharp from "sharp";
import path from "node:path";

async function main() {
  const IN = path.resolve(process.cwd(), "public", "logo.png");
  const OUT = path.resolve(process.cwd(), "public", "logo-white.png");

  const img = sharp(IN).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (channels !== 4) throw new Error(`Expected 4 channels (RGBA), got ${channels}`);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }

  await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(OUT);
  console.log(`Wrote ${OUT} (${width}x${height})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
