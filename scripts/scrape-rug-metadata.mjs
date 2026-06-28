/**
 * Scrape the legacy isberian.com catalog API for a list of rug IDs.
 *
 * The legacy site loads each rug detail page via http://service.isberian.com/api/
 * (discovered via wp-content/uploads/isberian/js/search_item.js). The
 * /item/?rmproid={id} endpoint returns full metadata as JSON — no auth, no
 * Cloudflare, just plain HTTP.
 *
 * Writes scripts/scraped-metadata.json keyed by ID. PRICE FIELDS ARE STRIPPED
 * to comply with CLAUDE.md rule 1 ("No prices, ever."). The scraped fields
 * we keep are: title, size, origin/region, material, style, type, condition,
 * the long description, and the upstream item ID.
 *
 *   node scripts/scrape-rug-metadata.mjs <id1> <id2> ...
 */
import { writeFile } from "node:fs/promises";

const API = (id) => `http://service.isberian.com/api/item/?rmproid=${id}`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const PRICE_FIELDS = new Set([
  "ItemCostDbl", "ItemCostStr",
  "ItemPriceDbl", "ItemPriceStr",
  "ItemPriceClearanceDbl", "ItemPriceClearanceStr",
  "ItemPriceEffectiveDbl", "ItemPriceEffectiveStr",
]);

function stripPrices(rec) {
  const out = {};
  for (const k of Object.keys(rec)) {
    if (PRICE_FIELDS.has(k)) continue;
    out[k] = rec[k];
  }
  return out;
}

async function fetchOne(id) {
  const res = await fetch(API(id), {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // The endpoint sometimes returns a single object, sometimes an array.
  const rec = Array.isArray(json) ? json[0] : json;
  if (!rec) throw new Error("empty payload");
  return stripPrices(rec);
}

async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length) {
    console.error("usage: node scripts/scrape-rug-metadata.mjs <id1> <id2> ...");
    process.exit(1);
  }

  const out = {};
  const failed = [];
  for (const id of ids) {
    try {
      const rec = await fetchOne(id);
      out[id] = rec;
      const title = rec.ItemDescription ?? `(no title)`;
      const size = `${rec.ItemSizeXStr ?? "?"} × ${rec.ItemSizeYStr ?? "?"}`;
      console.log(`  ${id}: ${title} · ${size}`);
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      console.warn(`  ${id}: FAILED — ${e.message}`);
      failed.push(id);
    }
  }

  await writeFile("scripts/scraped-metadata.json", JSON.stringify(out, null, 2));
  console.log(`\nScraped ${Object.keys(out).length}/${ids.length}. Failed: ${failed.join(", ") || "none"}.`);
  console.log(`→ scripts/scraped-metadata.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
