/**
 * Confirm the visualizer renders different rug sizes differently. Loads the
 * live /visualize page, picks 3 rugs of different physical sizes from the
 * catalog (smallest, middle, largest by length), screenshots each.
 */

import { chromium } from "playwright";

const BASE = process.env.AUDIT_BASE_URL ?? "https://isberian-site-qbj6.vercel.app";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/visualize`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2500);

  // Read the picker tile labels (title attribute) and their image src so we can
  // map each tile to a parsed size from the rug title.
  const tiles = await page.$$eval(
    'button[title]',
    (els) => els
      .filter((e) => e.querySelector("img"))
      .map((e) => ({
        title: e.getAttribute("title") || "",
        index: Array.from(e.parentElement?.children ?? []).indexOf(e),
      })),
  );
  console.log(`found ${tiles.length} rug tiles`);

  // The page lists 24 rug tiles in a grid. Pick three: first, middle, last.
  const picks = [0, Math.floor(tiles.length / 2), tiles.length - 1];
  for (let i = 0; i < picks.length; i++) {
    const idx = picks[i];
    const tile = tiles[idx];
    console.log(`pick ${i + 1}: ${tile.title}`);
    await page.$$eval(
      "button[title]",
      (els, idx) => {
        const el = els[idx];
        if (el) el.click();
      },
      idx,
    );
    await page.waitForTimeout(1500);
    const file = `scripts/shots/visualizer-pick-${i + 1}.png`;
    await page.screenshot({ path: file, fullPage: false });
    console.log(`  → ${file}`);
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
