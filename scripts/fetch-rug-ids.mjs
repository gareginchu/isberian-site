/**
 * Fetch a specific list of rug IDs from cdn.isberian.com.
 * Writes public/rugs/<id>.jpg for each. Skips IDs already on disk.
 *
 *   node scripts/fetch-rug-ids.mjs <id1> <id2> ...
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const CDN = (id) => `https://cdn.isberian.com/Content/Images/Items/Large/${id}.jpg`;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length) {
    console.error("usage: node scripts/fetch-rug-ids.mjs <id1> <id2> ...");
    process.exit(1);
  }
  await mkdir(RUGS_DIR, { recursive: true });

  const downloaded = [];
  const skipped = [];
  const failed = [];

  for (const id of ids) {
    const dest = path.join(RUGS_DIR, `${id}.jpg`);
    if (existsSync(dest)) {
      console.log(`  ${id}: already on disk, skipping`);
      skipped.push(id);
      continue;
    }
    try {
      const res = await fetch(CDN(id), {
        headers: {
          "User-Agent": UA,
          Accept: "image/jpeg,image/png,image/*;q=0.8",
          Referer: "https://www.isberian.com/",
        },
      });
      if (!res.ok) {
        console.warn(`  ${id}: HTTP ${res.status}`);
        failed.push({ id, status: res.status });
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5_000) {
        console.warn(`  ${id}: suspiciously small (${buf.length} bytes), skipping`);
        failed.push({ id, reason: "too small" });
        continue;
      }
      await writeFile(dest, buf);
      console.log(`  ${id}: saved (${(buf.length / 1024).toFixed(0)} KB)`);
      downloaded.push(id);
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      console.warn(`  ${id}: ${e instanceof Error ? e.message : e}`);
      failed.push({ id, reason: String(e) });
    }
  }

  console.log(`\nDownloaded ${downloaded.length} · Skipped ${skipped.length} · Failed ${failed.length}.`);
  if (downloaded.length) console.log(`New: ${downloaded.join(", ")}`);
  if (failed.length) console.log(`Failed: ${failed.map((f) => f.id).join(", ")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
