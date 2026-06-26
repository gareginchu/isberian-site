/**
 * Fetch the 8 hero slider images from the upstream isberian.com (WordPress / Fusion
 * Avada Flexslider) and overwrite our local copies at /public/hero/home-N.jpg.
 *
 *   pnpm tsx scripts/fetch-upstream-hero.ts
 *
 * Why: the legacy site serves a 1440x700-ish slider; our local pixel-sized copies
 * (1680x1000) were getting cropped by object-cover. Pulling the *upstream* files
 * gives us the exact crop the brand has been using for years.
 *
 * Order: the upstream Flexslider renders slides in DOM order:
 *   1 → 7 → 5 → 6 → 3 → 4 → 2 → 8
 * That matches app/page.tsx → HERO_SLIDES exactly. We key each downloaded file
 * by the upstream filename suffix (Home-N.jpg → home-N.jpg) so the existing order
 * in app/page.tsx is preserved untouched.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const HERO_DIR = path.resolve(process.cwd(), "public", "hero");
const HOMEPAGE = "https://www.isberian.com";

/** Slide info as scraped from the live DOM. */
type Slide = { domIndex: number; url: string; suffix: number };

async function scrapeUpstreamSlides(): Promise<Slide[]> {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(HOMEPAGE, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2500);

  // Dismiss the newsletter popup if present (it intercepts pointer events).
  const closers = [
    'button:has-text("No, thanks")',
    'button:has-text("No Thanks")',
    'a:has-text("No Thanks")',
    '[aria-label="Close"]',
    ".popmake-close",
    ".pum-close",
    "button.close",
  ];
  for (const sel of closers) {
    const btn = await page.$(sel);
    if (btn) {
      try {
        await btn.click({ timeout: 1500 });
        await page.waitForTimeout(400);
        break;
      } catch {
        /* ignore */
      }
    }
  }

  // Cycle through slides so any lazy-loaded backgrounds hydrate. Flexslider's
  // .flex-next click advances one slide; 12 clicks covers the 8-slide rotation
  // with margin. We pass plain strings (not closures) to evaluate to dodge an
  // esbuild/tsx quirk that injects __name helpers into transpiled arrows.
  await page.evaluate(`(async function () {
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    for (var i = 0; i < 12; i++) {
      var next = document.querySelector(".flex-next, .flex-direction-nav a.flex-next, a.flex-next");
      if (!next) break;
      next.click();
      await sleep(650);
    }
  })()`);

  await page.waitForTimeout(500);

  const raw: { idx: number; url: string | null }[] = await page.evaluate(`(function () {
    var root = document.querySelector(".fusion-slider-container .flexslider, .fusion-slider-container, .tfs-slider, .flexslider");
    if (!root) return [];
    var slides = Array.prototype.slice.call(root.querySelectorAll("li"));
    var out = [];
    for (var i = 0; i < slides.length; i++) {
      var li = slides[i];
      if (li.className && li.className.indexOf("flex-nav") !== -1) continue;
      // Slides render their photo as a background-image on a child .background-image div.
      var bgEl = li.querySelector(".background-image, .background, [style*=background]");
      var bg = bgEl ? getComputedStyle(bgEl).backgroundImage : "";
      var m = bg.match(/url\\(["']?(.+?)["']?\\)/);
      out.push({ idx: i, url: m ? m[1] : null });
    }
    return out;
  })()`);

  await browser.close();

  // Keep only the slides that actually have a background URL.
  const slides: Slide[] = [];
  for (const r of raw) {
    if (!r.url) continue;
    const suffixMatch = r.url.match(/Home-(\d+)\.jpg/i);
    if (!suffixMatch) continue;
    slides.push({ domIndex: r.idx, url: r.url, suffix: Number(suffixMatch[1]) });
  }
  return slides;
}

async function download(url: string): Promise<Buffer> {
  // The upstream WordPress host (LiteSpeed/Cloudflare) gates on UA — a custom
  // UA returns 403. It also content-negotiates WebP whenever the Accept header
  // advertises it. So: use a real Chrome UA, but advertise only JPEG/PNG in
  // Accept so we get the original JPEG source for /public/hero/.
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "image/jpeg,image/png,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: HOMEPAGE,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function main() {
  await mkdir(HERO_DIR, { recursive: true });
  const slides = await scrapeUpstreamSlides();
  if (slides.length === 0) throw new Error("No slides found upstream — slider markup may have changed.");

  console.log(`Found ${slides.length} upstream slides:`);
  for (const s of slides) {
    console.log(`  dom[${s.domIndex}] → Home-${s.suffix}.jpg ← ${s.url}`);
  }

  const results: {
    source: string;
    dest: string;
    bytes: number;
    width?: number;
    height?: number;
    ok: boolean;
    note?: string;
  }[] = [];

  // Deduplicate by suffix (in case the scrape returned the same slide twice).
  const bySuffix = new Map<number, Slide>();
  for (const s of slides) if (!bySuffix.has(s.suffix)) bySuffix.set(s.suffix, s);

  for (const [suffix, slide] of [...bySuffix.entries()].sort((a, b) => a[0] - b[0])) {
    const dest = path.join(HERO_DIR, `home-${suffix}.jpg`);
    try {
      const buf = await download(slide.url);
      // Sniff the magic bytes: real JPEGs start with FF D8 FF.
      const isJpegMagic = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
      const meta = await sharp(buf).metadata();
      const ok = isJpegMagic && meta.format === "jpeg" && !!meta.width && !!meta.height;
      if (ok) {
        await writeFile(dest, buf);
      }
      results.push({
        source: slide.url,
        dest,
        bytes: buf.length,
        width: meta.width,
        height: meta.height,
        ok,
        note: ok
          ? undefined
          : `bad payload: magic=${buf.slice(0, 4).toString("hex")} sharpFormat=${meta.format}`,
      });
    } catch (err) {
      results.push({
        source: slide.url,
        dest,
        bytes: 0,
        ok: false,
        note: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log("\nDownload summary:");
  for (const r of results) {
    const dim = r.width && r.height ? `${r.width}x${r.height}` : "?x?";
    const kb = (r.bytes / 1024).toFixed(1);
    const status = r.ok ? "OK " : "ERR";
    console.log(
      `  [${status}] ${path.basename(r.dest)} ${dim} (${kb} KB) ← ${r.source}${r.note ? "  // " + r.note : ""}`
    );
  }

  // Cross-check: confirm we covered all 8 expected suffixes (1..8).
  const got = new Set(results.filter((r) => r.ok).map((r) => path.basename(r.dest)));
  const missing: string[] = [];
  for (let i = 1; i <= 8; i++) {
    if (!got.has(`home-${i}.jpg`)) missing.push(`home-${i}.jpg`);
  }
  if (missing.length) {
    console.error(`\nMISSING: ${missing.join(", ")}`);
    process.exit(2);
  }
  console.log("\nAll 8 hero images present. Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
