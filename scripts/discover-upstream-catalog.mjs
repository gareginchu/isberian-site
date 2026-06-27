/**
 * Probe upstream isberian.com to discover where the catalog data lives:
 * - Open a search/catalog page in a headless browser
 * - Capture every network request the page makes
 * - Filter for catalog-shaped responses (JSON returning items)
 * - Print the endpoint + a sample of items so we know what to scrape
 */
import { chromium } from "playwright";

const CANDIDATE_URLS = [
  "https://www.isberian.com/rugs",
  "https://www.isberian.com/search",
  "https://www.isberian.com/clearance",
  "https://www.isberian.com/",
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const xhr = [];
  page.on("response", async (res) => {
    const url = res.url();
    const ct = res.headers()["content-type"] ?? "";
    const status = res.status();
    if (ct.includes("json") || /api|search|items|products|catalog/i.test(url)) {
      let preview = "";
      try {
        const txt = await res.text();
        preview = txt.slice(0, 220);
      } catch {}
      xhr.push({ status, ct, url, preview });
    }
  });

  for (const u of CANDIDATE_URLS) {
    console.log(`\n=== ${u}`);
    try {
      await page.goto(u, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(3500);

      // Try to read any inline JSON the page injected (Tractus Frenchgate often
      // bootstraps a window.__INITIAL_STATE__-ish object).
      const inline = await page.evaluate(() => {
        const keys = Object.keys(window).filter((k) => /catalog|inventory|products|items|search|state/i.test(k));
        const out = {};
        for (const k of keys) {
          const v = window[k];
          if (typeof v === "object" && v != null) {
            out[k] = JSON.stringify(v).slice(0, 220);
          }
        }
        // Also look for <script> tags that look like JSON payloads
        const scripts = Array.from(document.querySelectorAll("script:not([src])"))
          .map((s) => s.textContent || "")
          .filter((s) => /Items|Catalog|Inventory|results/i.test(s) && s.length > 100)
          .map((s) => s.slice(0, 300));
        return { globalKeys: out, scriptHints: scripts.slice(0, 3) };
      });
      console.log("inline hints:", JSON.stringify(inline, null, 2));
    } catch (e) {
      console.log("nav err:", e.message);
    }
  }

  console.log(`\n=== captured ${xhr.length} candidate requests`);
  // De-dupe URLs and show unique hosts
  const seen = new Set();
  for (const r of xhr) {
    const key = `${r.status} ${r.url.split("?")[0]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  ${r.status} ${r.ct.split(";")[0]} ${r.url}`);
    if (r.preview && r.ct.includes("json")) console.log(`     preview: ${r.preview.replace(/\s+/g, " ")}`);
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
