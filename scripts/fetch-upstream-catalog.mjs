/**
 * Fetch a diverse sample of rugs from the upstream isberian.com CDN.
 *
 * Why direct-from-CDN: the main site (www.isberian.com) started returning 403
 * to scrapers — Cloudflare WAF. But cdn.isberian.com serves rug photos by ID
 * directly, no auth, no WAF. We have a list of IDs from the earlier discovery
 * run (which DID succeed before the WAF tightened). Pull each via plain fetch.
 *
 *   node scripts/fetch-upstream-catalog.mjs [count]
 */

import { readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const TARGET_COUNT = parseInt(process.argv[2] ?? "20", 10);
const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const CDN = (id) => `https://cdn.isberian.com/Content/Images/Items/Large/${id}.jpg`;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// IDs captured during the earlier (pre-WAF) catalog discovery run. Spread
// across multiple upstream catalog batches — these tend to be newer/diverse
// stock vs the antique-heavy fixture set we already have.
const KNOWN_IDS = [
  // 89000s batch
  "89134", "89113", "89111", "89094", "89090", "89086", "89082", "89075", "89068",
  // 88800-88900s batch
  "88893", "88889", "88887", "88885", "88882", "88859", "88858", "88857", "88856",
  "88855", "88854", "88853", "88852", "88851", "88850", "88849", "88848", "88847",
  "88846", "88845", "88844", "88843", "88842", "88841", "88840", "88839", "88838",
  "88837", "88835", "88834", "88833",
  // 88200-88400s batch
  "88257", "88256", "88255", "88254", "88401",
];

async function main() {
  await mkdir(RUGS_DIR, { recursive: true });
  const existing = new Set(
    (await readdir(RUGS_DIR))
      .filter((f) => /^\d+\.jpg$/.test(f))
      .map((f) => f.replace(/\.jpg$/, "")),
  );
  console.log(`have ${existing.size} rugs already on disk`);

  // Spread the picks across the candidate range so we get a mix.
  const todo = KNOWN_IDS.filter((id) => !existing.has(id));
  const step = Math.max(1, Math.floor(todo.length / TARGET_COUNT));
  const picks = [];
  for (let i = 0; i < todo.length && picks.length < TARGET_COUNT; i += step) picks.push(todo[i]);
  console.log(`picking ${picks.length} IDs spread across ${todo.length} candidates\n`);

  const downloaded = [];
  for (const id of picks) {
    const dest = path.join(RUGS_DIR, `${id}.jpg`);
    if (existsSync(dest)) {
      console.log(`  ${id}: already on disk, skipping`);
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
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5_000) {
        console.warn(`  ${id}: suspiciously small (${buf.length} bytes), skipping`);
        continue;
      }
      await writeFile(dest, buf);
      console.log(`  ${id}: saved (${(buf.length / 1024).toFixed(0)} KB)`);
      downloaded.push(id);
      // Tiny gap so we don't hammer the CDN.
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      console.warn(`  ${id}: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`\nDone. Downloaded ${downloaded.length} new rugs.`);
  console.log(`New IDs: ${downloaded.join(", ")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
