/**
 * Fetch the two new room photos from the sourcing pass (Unsplash + Pixabay).
 * Photos go to public/visualizer/rooms/<slot>.jpg.
 */
import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const TARGETS = [
  {
    slot: "living-modern",
    pageUrl: "https://unsplash.com/photos/minimalist-living-room-with-wooden-sideboard-aX1TTOuq83M",
    // Unsplash exposes a "download photo" button — we'll click it / use the direct CDN URL.
    // Unsplash photo IDs encode in the URL: aX1TTOuq83M
    unsplashId: "aX1TTOuq83M",
  },
  {
    slot: "loft",
    pageUrl: "https://pixabay.com/photos/apartment-accommodation-flat-loft-406901/",
    pixabayId: "406901",
  },
];

const OUT_DIR = path.resolve(process.cwd(), "public", "visualizer", "rooms");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const t of TARGETS) {
    console.log(`\n=== ${t.slot}`);
    try {
      await page.goto(t.pageUrl, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(2500);

      // Find the highest-resolution image on the page. Both Unsplash and Pixabay
      // expose it via the open graph meta tag.
      const imgUrl = await page.evaluate(() => {
        const og = document.querySelector('meta[property="og:image"]');
        return og?.getAttribute("content") ?? null;
      });
      if (!imgUrl) {
        console.warn("  no og:image found");
        continue;
      }
      console.log(`  fetching ${imgUrl.slice(0, 80)}…`);

      // Sometimes og:image has size params we want to upgrade. For Unsplash we can
      // force max width; for Pixabay we accept whatever og returns.
      let finalUrl = imgUrl;
      if (/images\.unsplash\.com/.test(finalUrl)) {
        finalUrl = finalUrl.replace(/&?w=\d+/, "").replace(/&?q=\d+/, "") + "&w=3000&q=85";
      }

      const resp = await fetch(finalUrl, {
        headers: { Referer: t.pageUrl, "User-Agent": "Mozilla/5.0" },
      });
      if (!resp.ok) {
        console.warn(`  HTTP ${resp.status}`);
        continue;
      }
      const buf = Buffer.from(await resp.arrayBuffer());
      const out = path.join(OUT_DIR, `${t.slot}.jpg`);
      await writeFile(out, buf);
      console.log(`  → ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.warn(`  ${t.slot}: ${e instanceof Error ? e.message : e}`);
    }
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
