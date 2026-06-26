/**
 * Screenshot the live MVP for embedding into the comparison deck.
 *   pnpm shots
 * Writes PNGs to scripts/shots/.
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "https://isberian-site-qbj6.vercel.app";
const OUT = path.resolve(process.cwd(), "scripts", "shots");

type Shot = {
  name: string;
  url: string;
  /** ms to wait after load before snapping — for fonts and the carousel. */
  settleMs?: number;
  /** Element to click open before the shot (e.g. concierge pill). */
  openConcierge?: boolean;
  /** Crop only to viewport (vs. full page). */
  viewportOnly?: boolean;
};

const SHOTS: Shot[] = [
  { name: "home-hero", url: "/", settleMs: 1500, viewportOnly: true },
  { name: "home-full", url: "/", settleMs: 1500 },
  { name: "rugs-grid", url: "/rugs", settleMs: 1500 },
  {
    name: "rug-detail",
    url: "/rugs/imperial-medallion-kazak-1888-17109",
    settleMs: 1500,
  },
  { name: "discover", url: "/discover", settleMs: 1500, viewportOnly: true },
  {
    name: "concierge-open",
    url: "/rugs",
    settleMs: 1500,
    openConcierge: true,
    viewportOnly: true,
  },
  { name: "identify", url: "/identify", settleMs: 1500, viewportOnly: true },
  {
    name: "services-triage",
    url: "/services/triage",
    settleMs: 1500,
    viewportOnly: true,
  },
  { name: "care", url: "/care", settleMs: 1500 },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // crisper screenshots for the deck
  });
  const page = await context.newPage();

  for (const shot of SHOTS) {
    const url = `${BASE}${shot.url}`;
    console.log(`Capturing ${shot.name} ← ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      if (shot.settleMs) await page.waitForTimeout(shot.settleMs);
      if (shot.openConcierge) {
        await page
          .getByRole("button", { name: /Open concierge/i })
          .click({ timeout: 5000 });
        await page.waitForTimeout(800);
      }
      const file = path.join(OUT, `${shot.name}.png`);
      await page.screenshot({
        path: file,
        fullPage: !shot.viewportOnly,
      });
      console.log(`  → ${file}`);
    } catch (err) {
      console.error(`  ! failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  await browser.close();
  console.log(`Done. ${SHOTS.length} shots in ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
