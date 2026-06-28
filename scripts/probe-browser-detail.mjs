/**
 * Probe per-rug detail URLs via a real browser (gets past Cloudflare WAF).
 * Tries the same URL patterns the plain-fetch probe tried, but with Playwright
 * so we see what the WAF lets through. For each candidate URL, reports:
 *   - HTTP status
 *   - final URL after redirects
 *   - whether the rendered page contains the rug ID in its body text
 *   - title tag
 */
import { chromium } from "playwright";

const ID = process.argv[2] ?? "83542";
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
];

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  for (const p of PATTERNS) {
    const url = p(ID);
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(1500);
      const finalUrl = page.url();
      const title = await page.title();
      const bodyText = (await page.textContent("body").catch(() => ""))?.slice(0, 1000) ?? "";
      const hasId = bodyText.includes(ID);
      const status = res?.status() ?? "?";
      console.log(`  ${status} ${url}`);
      console.log(`    → final: ${finalUrl}`);
      console.log(`    title:  ${title}`);
      console.log(`    hasId:  ${hasId}`);
      if (hasId) {
        // Look for size patterns in body text
        const sizeMatch = bodyText.match(/\d+\s*'\s*\d*\s*"?\s*[x×]\s*\d+\s*'\s*\d*\s*"?/);
        if (sizeMatch) console.log(`    SIZE:   ${sizeMatch[0]}`);
        console.log(`    body excerpt: ${bodyText.replace(/\s+/g, " ").slice(0, 300)}`);
      }
    } catch (e) {
      console.log(`  ERR  ${url} — ${e.message.split("\n")[0]}`);
    }
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
