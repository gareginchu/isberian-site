/**
 * Fetch the legacy search_item.js, extract the API endpoints,
 * then probe the catalog API directly.
 */
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Get the search_item.js content
  console.log("== Fetching search_item.js");
  await page.goto("https://www.isberian.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1500);
  const js = await page.evaluate(async () => {
    const r = await fetch("/wp-content/uploads/isberian/js/search_item.js");
    return r.ok ? await r.text() : null;
  });
  if (!js) { console.log("failed to fetch JS"); return; }
  console.log(`  got ${js.length} bytes\n`);

  // Print the first 3500 chars
  console.log("== First 3500 chars of search_item.js");
  console.log(js.slice(0, 3500));
  console.log("\n[...]\n");

  // Look for endpoint paths (URLs ending in / or specific paths)
  const apiPaths = [...js.matchAll(/['"]([^'"]*api[^'"]*)['"]/gi)].map(m => m[1]);
  const uniquePaths = [...new Set(apiPaths)];
  console.log(`== Found ${uniquePaths.length} API-ish strings:`);
  for (const p of uniquePaths.slice(0, 40)) console.log(`  ${p}`);

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
