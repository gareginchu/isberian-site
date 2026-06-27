/**
 * Mobile responsiveness audit — capture 4 key routes at iPhone-class viewport.
 *   node scripts/mobile-audit.mjs
 * Output: scripts/shots/mobile/*.png (gitignored)
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.AUDIT_BASE_URL ?? "https://isberian-site-qbj6.vercel.app";
const OUT = path.resolve(process.cwd(), "scripts", "shots", "mobile");

const ROUTES = [
  { name: "home", url: "/" },
  { name: "rugs", url: "/rugs" },
  { name: "pdp", url: "/rugs/imperial-medallion-kazak-1888-17109" },
  { name: "triage", url: "/services/triage" },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();

  for (const r of ROUTES) {
    const url = `${BASE}${r.url}`;
    console.log(`Capturing ${r.name} ← ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(2000);
      const file = path.join(OUT, `${r.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`  → ${file}`);
    } catch (err) {
      console.error(`  ! failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
