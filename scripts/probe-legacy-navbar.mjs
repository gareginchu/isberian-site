/**
 * Capture screenshots of how the navbar dropdown opens on isberian.com.
 * Hovers Rugs and CLEANING/SERVICES specifically (those are the two parent
 * menus with submenus), captures the open state.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

async function main() {
  await mkdir("scripts/shots", { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  console.log("Loading isberian.com…");
  await page.goto("https://www.isberian.com/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2500);

  // Idle screenshot of the navbar area
  await page.screenshot({ path: "scripts/shots/legacy-nav-idle.png", clip: { x: 0, y: 0, width: 1440, height: 200 } });
  console.log("  captured: scripts/shots/legacy-nav-idle.png");

  // The Avada/Fusion theme uses 'a' elements inside menu items; hover via JS to bypass visibility issues
  const triggers = [
    { name: "rugs", text: "Rugs" },
    { name: "cleaning", text: "Cleaning/Services" },
  ];

  for (const t of triggers) {
    console.log(`\nHovering on ${t.text}…`);
    const handle = await page.evaluateHandle((text) => {
      // Visible top-level menu link with this text
      const links = Array.from(document.querySelectorAll('nav a, .menu a, [class*="menu"] a'));
      const found = links.find((a) => {
        const t = (a.textContent ?? "").trim();
        if (t !== text) return false;
        const r = a.getBoundingClientRect();
        return r.top > 0 && r.top < 200 && r.width > 0 && r.height > 0;
      });
      if (!found) return null;
      // Dispatch mouseenter and mouseover up the tree so JS handlers fire
      const evt = new MouseEvent("mouseover", { bubbles: true });
      found.dispatchEvent(evt);
      const evt2 = new MouseEvent("mouseenter", { bubbles: false });
      found.dispatchEvent(evt2);
      // Also trigger on the parent li
      const li = found.closest("li");
      if (li) {
        li.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        li.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
      }
      return found;
    }, t.text);

    if (handle.asElement()) {
      try {
        await handle.asElement().hover({ force: true });
      } catch (e) {
        console.log("  (force-hover threw, dispatched event manually instead)");
      }
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `scripts/shots/legacy-nav-${t.name}-open.png`, clip: { x: 0, y: 0, width: 1440, height: 500 } });
      console.log(`  captured: scripts/shots/legacy-nav-${t.name}-open.png`);
    } else {
      console.log(`  ${t.text} not found`);
    }

    // Move mouse away
    await page.mouse.move(10, 800);
    await page.waitForTimeout(800);
  }

  await browser.close();
  console.log("\nDone. Screenshots in scripts/shots/");
}

main().catch((e) => { console.error(e); process.exit(1); });
