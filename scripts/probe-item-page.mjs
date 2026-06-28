/**
 * Load /Item/<id> in a real browser and inspect what arrives after the
 * legacy AJAX call completes — capture network requests, body text,
 * and any size/title we can read out.
 */
import { chromium } from "playwright";

const ID = process.argv[2] ?? "83542";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const requests = [];
  page.on("response", async (res) => {
    const url = res.url();
    const ct = res.headers()["content-type"] ?? "";
    if (res.status() >= 400) return;
    if (ct.includes("json") || /\bapi\b|search|item|inventory|product|catalog/i.test(url)) {
      let preview = "";
      try {
        const txt = await res.text();
        if (txt.includes(ID) || /size|width|length|origin|title/i.test(txt)) {
          preview = txt.slice(0, 400).replace(/\s+/g, " ");
        }
      } catch {}
      requests.push({ status: res.status(), url, ct, preview });
    }
  });

  // Visit homepage first so cookies are set, then navigate to /Item/<id>
  console.log("== Visiting homepage to set cookies");
  await page.goto("https://www.isberian.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2500);

  console.log(`\n== Navigating to /Item/${ID}`);
  const res = await page.goto(`https://www.isberian.com/Item/${ID}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log(`  status: ${res?.status()}, final URL: ${page.url()}`);

  console.log("\n== Waiting 8s for JS / AJAX to complete...");
  await page.waitForTimeout(8000);

  const finalUrl = page.url();
  const title = await page.title();
  const body = (await page.textContent("body").catch(() => "")) ?? "";

  console.log(`\n  final URL: ${finalUrl}`);
  console.log(`  title:     ${title}`);
  console.log(`  body len:  ${body.length}`);

  const hasId = body.includes(ID);
  console.log(`  hasId in body: ${hasId}`);
  if (hasId) {
    const idx = body.indexOf(ID);
    const ctxStart = Math.max(0, idx - 200);
    const ctxEnd = Math.min(body.length, idx + 400);
    console.log(`  context: ...${body.slice(ctxStart, ctxEnd).replace(/\s+/g, " ")}...`);
  }

  // Hunt for size patterns
  const sizes = body.match(/\d+\s*'\s*\d*\s*"?\s*[x×X]\s*\d+\s*'\s*\d*\s*"?/g);
  if (sizes) console.log(`  sizes found: ${sizes.slice(0, 5).join(" | ")}`);

  console.log(`\n== Captured ${requests.length} candidate requests:`);
  const seen = new Set();
  for (const r of requests) {
    const key = r.url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  ${r.status} ${r.url.split("?")[0]}`);
    if (r.preview) console.log(`     preview: ${r.preview.slice(0, 250)}`);
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
