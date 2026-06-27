/**
 * Bulk-fetch rug candidates from cdn.isberian.com to build a diverse catalog.
 *
 * Strategy: sample rug IDs across the full range of upstream catalog stock
 * (vintage 14000s through current 89000s). The main isberian.com site is
 * Cloudflare-protected, but the CDN serves images by ID without auth. We try
 * each ID; valid IDs return a real image, invalid ones 404.
 *
 * Skips IDs already on disk (lets us re-run safely). Skips the 46 originals
 * we just deleted (don't refetch).
 *
 *   node scripts/bulk-fetch-rugs.mjs
 *
 * Output: public/rugs/<id>.jpg for every successful download.
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const CDN = (id) => `https://cdn.isberian.com/Content/Images/Items/Large/${id}.jpg`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// 46 IDs we just deleted — don't refetch.
const DELETED = new Set([
  "14010", "14149", "14204", "17109", "17370", "18778", "19016", "19017",
  "22084", "22085", "24122", "25270", "31010", "31018", "31755", "32364",
  "34545", "36192", "43370", "43371", "43373", "43911", "51108", "52285",
  "53276", "62274", "63000", "67432", "69068", "70703", "73404", "76404",
  "76522", "76820", "77529", "77546", "77548", "78529", "80335", "80337",
  "83541", "84070", "84195", "86335", "86721", "86777",
]);

// Sample plan: diverse vintages → diverse rug types. Older IDs tend to be
// older catalog stock (antique deeper), newer IDs tend to be newer stock
// (contemporary, modern, runners). Sample more densely in newer ranges
// because they're more likely to be in-catalog still.
function buildCandidates() {
  const ids = new Set();
  // Older vintage / antique range — sparser
  for (let i = 14000; i < 25000; i += 300) ids.add(String(i));
  for (let i = 25000; i < 50000; i += 500) ids.add(String(i));
  // Mid-era
  for (let i = 50000; i < 80000; i += 250) ids.add(String(i));
  // Newer catalog — denser
  for (let i = 80000; i < 87500; i += 100) ids.add(String(i));
  // Around our 88000s/89000s keepers — fine-grained sweep
  for (let i = 87500; i < 89500; i += 25) ids.add(String(i));
  return [...ids];
}

async function existingIds() {
  const files = await readdir(RUGS_DIR);
  return new Set(files.filter((f) => /^\d+\.jpg$/.test(f)).map((f) => f.replace(/\.jpg$/, "")));
}

async function main() {
  await mkdir(RUGS_DIR, { recursive: true });
  const existing = await existingIds();
  const candidates = buildCandidates()
    .filter((id) => !DELETED.has(id) && !existing.has(id));
  console.log(`Trying ${candidates.length} candidate IDs (skip 46 deleted + ${existing.size} on disk)`);

  const downloaded = [];
  const failed = [];
  let batch = 0;

  // Concurrency 5 — CDN handles it fine, gentle on bandwidth.
  for (let i = 0; i < candidates.length; i += 5) {
    const slice = candidates.slice(i, i + 5);
    batch++;
    await Promise.all(slice.map(async (id) => {
      try {
        const res = await fetch(CDN(id), {
          headers: {
            "User-Agent": UA,
            Accept: "image/jpeg,image/png,image/*;q=0.8",
            Referer: "https://www.isberian.com/",
          },
        });
        if (!res.ok) {
          failed.push({ id, status: res.status });
          return;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 8_000) {
          failed.push({ id, reason: `too small (${buf.length}B)` });
          return;
        }
        await writeFile(path.join(RUGS_DIR, `${id}.jpg`), buf);
        downloaded.push({ id, size: buf.length });
      } catch (e) {
        failed.push({ id, reason: e instanceof Error ? e.message : "fetch error" });
      }
    }));
    if (batch % 20 === 0) {
      console.log(`  [${i + 5}/${candidates.length}] downloaded ${downloaded.length}, skipped ${failed.length}`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Downloaded: ${downloaded.length}`);
  console.log(`  Skipped:    ${failed.length}`);
  console.log(`\nNew rug IDs:`);
  console.log("  " + downloaded.map((d) => d.id).join(", "));
}

main().catch((e) => { console.error(e); process.exit(1); });
