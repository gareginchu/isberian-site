/**
 * Discover the URL pattern for a single rug's detail page on isberian.com.
 *
 * Tries common Tractus/Frenchgate-style URL patterns first via plain fetch
 * (anything that returns 200 with an HTML body containing the ID is a hit).
 * If all fail, falls back to Playwright — load the home page, run the on-site
 * search for the ID, capture the destination URL the search lands on.
 *
 * Usage: node scripts/probe-isberian-detail-url.mjs <id>
 */
import { chromium } from "playwright";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const PATTERNS = [
  (id) => `https://www.isberian.com/Item/${id}`,
  (id) => `https://www.isberian.com/Items/${id}`,
  (id) => `https://www.isberian.com/Item.aspx?id=${id}`,
  (id) => `https://www.isberian.com/Inventory/${id}`,
  (id) => `https://www.isberian.com/Catalog/Item/${id}`,
  (id) => `https://www.isberian.com/rug/${id}`,
  (id) => `https://www.isberian.com/rugs/${id}`,
  (id) => `https://www.isberian.com/product/${id}`,
  (id) => `https://www.isberian.com/products/${id}`,
  (id) => `https://www.isberian.com/?p=${id}`,
];

async function tryPlainFetch(id) {
  console.log(`\n── Plain fetch probes for ID ${id}\n`);
  const hits = [];
  for (const p of PATTERNS) {
    const url = p(id);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8" },
        redirect: "manual",
      });
      const body = res.status === 200 ? (await res.text()).slice(0, 200) : "";
      const hasId = body.includes(id);
      console.log(`  ${res.status} ${url}${res.status === 200 && hasId ? " ✓ contains id" : ""}`);
      if (res.status === 200 && hasId) hits.push({ url, body });
      // Also collect redirects — Location header often points to the canonical URL
      const loc = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && loc) {
        console.log(`     → Location: ${loc}`);
      }
    } catch (e) {
      console.log(`  ERR ${url} — ${e.message}`);
    }
  }
  return hits;
}

async function trySearchViaPlaywright(id) {
  console.log(`\n── Playwright fallback: load isberian.com, search for ${id}\n`);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    const requests = [];
    page.on("response", (res) => {
      const url = res.url();
      const ct = res.headers()["content-type"] ?? "";
      if (res.status() < 400 && (ct.includes("html") || /api|search|item|product/i.test(url))) {
        requests.push({ status: res.status(), url, ct });
      }
    });

    // Step 1: home page
    try {
      await page.goto("https://www.isberian.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
      console.log(`  loaded ${page.url()}`);
    } catch (e) {
      console.log(`  home fetch failed: ${e.message}`);
    }
    await page.waitForTimeout(2000);

    // Step 2: look for a search form. Try several common selectors.
    const searchSelectors = [
      'input[name="search"]',
      'input[type="search"]',
      'input[name="q"]',
      'input[placeholder*="search" i]',
      'input[aria-label*="search" i]',
    ];
    let searchEl = null;
    for (const sel of searchSelectors) {
      const el = await page.$(sel);
      if (el) { searchEl = el; console.log(`  found search input: ${sel}`); break; }
    }
    if (searchEl) {
      await searchEl.fill(id);
      await searchEl.press("Enter");
      await page.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);
      console.log(`  after search: ${page.url()}`);
      // Look for a result link to a detail page
      const links = await page.$$eval("a[href]", (as, id) => as.map((a) => a.getAttribute("href"))
        .filter((h) => h && (h.includes(id) || /item|product|rug/i.test(h))), id);
      console.log(`  found ${links.length} relevant links:`);
      for (const l of links.slice(0, 12)) console.log(`    ${l}`);
    } else {
      console.log("  no on-site search input found; trying URL ?s=<id>");
      await page.goto(`https://www.isberian.com/?s=${id}`, { waitUntil: "domcontentloaded" }).catch(() => {});
      await page.waitForTimeout(2500);
      console.log(`  ${page.url()}`);
    }

    console.log(`\n  Network requests seen (filtered):`);
    const seen = new Set();
    for (const r of requests) {
      const key = `${r.status} ${r.url.split("?")[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`    ${r.status} ${r.url}`);
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("usage: node scripts/probe-isberian-detail-url.mjs <id>");
    process.exit(1);
  }
  const hits = await tryPlainFetch(id);
  if (hits.length) {
    console.log(`\n✓ Plain-fetch hits:`);
    for (const h of hits) console.log(`  ${h.url}`);
    return;
  }
  await trySearchViaPlaywright(id);
}

main().catch((e) => { console.error(e); process.exit(1); });
