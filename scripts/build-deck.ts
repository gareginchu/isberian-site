/**
 * Build a comparison deck: AI-native MVP vs. live isberian.com.
 * Run with: pnpm deck:build  (after pnpm shots, so screenshots exist)
 * Output:   isberian-mvp-comparison.pptx (in repo root)
 *
 * Visual style mirrors the site: ink on cream, sans-serif primary, restrained.
 */

import PptxGenJS from "pptxgenjs";
import path from "node:path";
import { existsSync } from "node:fs";

const INK = "1F1F1E";
const MUTED = "6E6E6C";
const PAPER = "FAFAF8";
const STONE = "F1F1EE";
const ACCENT = "6B1F1A";

const SANS = "Inter";
const SERIF = "Georgia";

const SHOTS = path.resolve(process.cwd(), "scripts", "shots");
const shot = (name: string) => {
  const p = path.join(SHOTS, `${name}.png`);
  if (!existsSync(p)) {
    console.warn(`Missing screenshot: ${p}. Run \`pnpm shots\` first.`);
    return null;
  }
  return p;
};

function makeDeck() {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Oscar Isberian Rugs — AI-Native MVP vs. Live Site";
  pres.author = "Isberian site team";

  pres.defineSlideMaster({
    title: "BASE",
    background: { color: PAPER },
    objects: [
      {
        text: {
          text: "Oscar Isberian Rugs · MVP vs. live site",
          options: {
            x: 0.5, y: 0.3, w: 6, h: 0.3,
            fontFace: SANS, fontSize: 9, color: MUTED, charSpacing: 3,
          },
        },
      },
    ],
    slideNumber: { x: 12.5, y: 7.0, fontFace: SANS, fontSize: 9, color: MUTED },
  });

  // ── 1. cover ─────────────────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    const hero = shot("home-hero");
    if (hero) {
      s.addImage({ path: hero, x: 0, y: 0, w: 13.33, h: 7.5, sizing: { type: "cover", w: 13.33, h: 7.5 } });
      s.addShape("rect", { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: INK, transparency: 35 }, line: { color: INK, transparency: 100 } });
    }
    s.addText("Chicago since 1920", {
      x: 0.7, y: 2.4, w: 12, h: 0.4,
      fontFace: SANS, fontSize: 11, color: "C9C9C5", charSpacing: 5,
    });
    s.addText("Oscar Isberian Rugs", {
      x: 0.7, y: 2.8, w: 12, h: 1.2,
      fontFace: SERIF, fontSize: 60, color: PAPER,
    });
    s.addText("AI-native MVP — what's different from isberian.com", {
      x: 0.7, y: 4.1, w: 12, h: 0.6,
      fontFace: SANS, fontSize: 22, color: STONE,
    });
    s.addText("A short visual comparison of parity, additions, gaps, and the operating principles behind each.", {
      x: 0.7, y: 4.8, w: 11, h: 1,
      fontFace: SANS, fontSize: 14, color: "A89E94",
    });
    s.addText("June 2026", {
      x: 0.7, y: 6.6, w: 6, h: 0.3,
      fontFace: SANS, fontSize: 10, color: MUTED, charSpacing: 3,
    });
  }

  // ── 2. executive summary ─────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("Executive summary", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("Same heritage. Same business model. Different way in.", {
      x: 0.5, y: 1.3, w: 12, h: 1.0,
      fontFace: SERIF, fontSize: 32, color: INK,
    });
    const rows = [
      ["Brand identity", "Matched — wordmark, palette, hero, nav, voice."],
      ["Business model", "Identical — quoted only, no public prices, showroom-first."],
      ["AI surfaces", "New — concierge, vision identify, service triage, FAQ grounding."],
      ["Architecture", "Modernized — Next.js + React 19 vs WordPress/Avada."],
      ["Catalog", "Re-modeled — structured RugDescription blocks vs free prose."],
      ["Operational rules", "Codified — five guardrails enforced by CI."],
      ["Performance / a11y", "Engineered — Core Web Vitals, WCAG 2.2 AA targets."],
      ["Content depth", "Behind — 46 rugs vs hundreds; no real CMS connected yet."],
    ];
    rows.forEach((r, i) => {
      const y = 2.55 + i * 0.5;
      s.addText(r[0]!, { x: 0.7, y, w: 2.6, h: 0.45, fontFace: SANS, fontSize: 13, bold: true, color: INK });
      s.addText(r[1]!, { x: 3.5, y, w: 9.3, h: 0.45, fontFace: SANS, fontSize: 13, color: "3A3A38" });
      s.addShape("line", { x: 0.7, y: y + 0.42, w: 12, h: 0, line: { color: "C9C9C5", width: 0.5 } });
    });
  }

  // ── 3. home: live + MVP ──────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("The new home page", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("Same hero rotation, restrained type, calmer overlay.", {
      x: 0.5, y: 1.3, w: 12, h: 0.9,
      fontFace: SERIF, fontSize: 28, color: INK,
    });
    const home = shot("home-hero");
    if (home) {
      s.addImage({ path: home, x: 0.5, y: 2.4, w: 8.6, h: 4.8, sizing: { type: "cover", w: 8.6, h: 4.8 } });
      s.addShape("rect", { x: 0.5, y: 2.4, w: 8.6, h: 4.8, fill: { color: INK, transparency: 100 }, line: { color: INK, width: 0.75 } });
    }
    // notes column
    s.addText("What's matched", {
      x: 9.5, y: 2.5, w: 3.4, h: 0.4,
      fontFace: SANS, fontSize: 11, color: ACCENT, charSpacing: 3,
    });
    s.addText(
      "• Same 8 photos — exact upstream order\n• Flexslider-style dot indicators\n• 7-second auto-advance\n• Pause on hover and focus\n• Reduced-motion aware",
      { x: 9.5, y: 2.95, w: 3.4, h: 2.5, fontFace: SANS, fontSize: 12, color: "3A3A38" },
    );
    s.addText("What's different", {
      x: 9.5, y: 5.5, w: 3.4, h: 0.4,
      fontFace: SANS, fontSize: 11, color: ACCENT, charSpacing: 3,
    });
    s.addText(
      "• Sans-serif primary, restrained\n• Calmer dark overlay\n• Floating 'Ask the concierge'",
      { x: 9.5, y: 5.95, w: 3.4, h: 1.5, fontFace: SANS, fontSize: 12, color: "3A3A38" },
    );
  }

  // ── 4. matched 1:1 ───────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("Matched 1:1", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("What we kept the same — on purpose.", {
      x: 0.5, y: 1.3, w: 12, h: 1.0,
      fontFace: SERIF, fontSize: 32, color: INK,
    });
    const matched = [
      ["Hero carousel", "Same 8 photos; same slide order (1 → 7 → 5 → 6 → 3 → 4 → 2 → 8); dot indicators; 7s interval."],
      ["Primary navigation", "Rugs · Carpeting · Custom · Cleaning & Restoration · On the floor now · Trade benefits · Contact us · Wishlists."],
      ["Showrooms", "Chicago (120 W Kinzie) and Evanston (1028 Chicago Ave) — addresses, hours, phones, both phone CTAs surfaced site-wide."],
      ["Voice", "Quoted only. No public prices. Showroom-first. Trade-aware. Heritage register, no marketing varnish."],
      ["Partners", "IIDA, ASID, RugMark, Michael Del Piero Good Design, Soucie Horner — same strip layout."],
      ["Page architecture", "Home → 4 action tiles → Rugs by Style → Step-by-Step → Repair & Restoration → Showrooms → Press → Newsletter."],
    ];
    matched.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.5 + col * 6.3;
      const y = 2.4 + row * 1.5;
      s.addShape("rect", { x, y, w: 6, h: 1.3, fill: { color: STONE }, line: { color: STONE } });
      s.addText(m[0]!, { x: x + 0.25, y: y + 0.1, w: 5.6, h: 0.35, fontFace: SANS, fontSize: 14, bold: true, color: INK });
      s.addText(m[1]!, { x: x + 0.25, y: y + 0.45, w: 5.6, h: 0.8, fontFace: SANS, fontSize: 11, color: "3A3A38" });
    });
  }

  // ── 5. concierge ─────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("AI surface · 01", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("Concierge — conversation as the front door.", {
      x: 0.5, y: 1.3, w: 12, h: 0.9,
      fontFace: SERIF, fontSize: 28, color: INK,
    });
    const cn = shot("concierge-open");
    if (cn) {
      s.addImage({ path: cn, x: 0.5, y: 2.4, w: 7, h: 4.6, sizing: { type: "cover", w: 7, h: 4.6 } });
      s.addShape("rect", { x: 0.5, y: 2.4, w: 7, h: 4.6, fill: { color: INK, transparency: 100 }, line: { color: INK, width: 0.75 } });
    }
    const points = [
      ["Model", "claude-sonnet-4-6 with prompt-cached system + tools."],
      ["Tools", "search_inventory, answer_faq, find_similar, book_appointment, create_lead."],
      ["Voice", "One source. No emoji. No exclamations. No superlatives."],
      ["Grounding", "Can only name rugs returned by search_inventory."],
      ["FAQ", "KB-grounded. Silk + antique → professional-only."],
      ["Failure mode", "Tool error → hand off to a showroom phone. Never guess."],
    ];
    points.forEach((p, i) => {
      const y = 2.5 + i * 0.75;
      s.addText(p[0]!, { x: 7.9, y, w: 1.5, h: 0.6, fontFace: SANS, fontSize: 11, bold: true, color: INK });
      s.addText(p[1]!, { x: 9.4, y, w: 3.5, h: 0.7, fontFace: SANS, fontSize: 10.5, color: "3A3A38" });
    });
  }

  // ── 6. vision: identify + triage ─────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("AI surfaces · 02 + 03", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("Vision: identification and service triage.", {
      x: 0.5, y: 1.3, w: 12, h: 0.9,
      fontFace: SERIF, fontSize: 28, color: INK,
    });

    // identify column
    const id = shot("identify");
    if (id) {
      s.addImage({ path: id, x: 0.5, y: 2.4, w: 6, h: 2.5, sizing: { type: "cover", w: 6, h: 2.5 } });
      s.addShape("rect", { x: 0.5, y: 2.4, w: 6, h: 2.5, fill: { color: INK, transparency: 100 }, line: { color: INK, width: 0.5 } });
    }
    s.addText("Identify a rug", { x: 0.5, y: 5.0, w: 6, h: 0.4, fontFace: SERIF, fontSize: 18, color: INK });
    s.addText(
      "Owner uploads photos. Vision returns origin / age band / type with confidence, plus the visual tells the model used and what's missing in the photo. Definitive identification always in person.",
      { x: 0.5, y: 5.4, w: 6, h: 1.7, fontFace: SANS, fontSize: 11, color: "3A3A38" },
    );

    // triage column
    const tr = shot("services-triage");
    if (tr) {
      s.addImage({ path: tr, x: 6.8, y: 2.4, w: 6, h: 2.5, sizing: { type: "cover", w: 6, h: 2.5 } });
      s.addShape("rect", { x: 6.8, y: 2.4, w: 6, h: 2.5, fill: { color: INK, transparency: 100 }, line: { color: INK, width: 0.5 } });
    }
    s.addText("Service triage", { x: 6.8, y: 5.0, w: 6, h: 0.4, fontFace: SERIF, fontSize: 18, color: INK });
    s.addText(
      "Photos + a short note → issues, severity band (light → specialist-only), and next step (drop-off / house-call / ship-in / showroom). Never DIY for valuable pieces.",
      { x: 6.8, y: 5.4, w: 6, h: 1.7, fontFace: SANS, fontSize: 11, color: "3A3A38" },
    );
  }

  // ── 7. the collection — grid ─────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("The collection", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("46 real rugs, filterable, no prices.", {
      x: 0.5, y: 1.3, w: 12, h: 0.9,
      fontFace: SERIF, fontSize: 28, color: INK,
    });
    const grid = shot("rugs-grid");
    if (grid) {
      s.addImage({ path: grid, x: 0.5, y: 2.4, w: 8.6, h: 4.8, sizing: { type: "cover", w: 8.6, h: 4.8 } });
      s.addShape("rect", { x: 0.5, y: 2.4, w: 8.6, h: 4.8, fill: { color: INK, transparency: 100 }, line: { color: INK, width: 0.75 } });
    }
    s.addText("How it differs", {
      x: 9.5, y: 2.5, w: 3.4, h: 0.4,
      fontFace: SANS, fontSize: 11, color: ACCENT, charSpacing: 3,
    });
    s.addText(
      "• Real photos from upstream catalog\n• Aspect ratios match the rug (runner is a runner)\n• Facets: origin, color family, size band, technique\n• Square cards, object-contain, no top-crop\n• Status badges (sold / on memo) never a price",
      { x: 9.5, y: 2.95, w: 3.4, h: 3, fontFace: SANS, fontSize: 12, color: "3A3A38" },
    );
  }

  // ── 8. structured rug description ────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("Catalog model", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("Structured rug descriptions, not free prose.", {
      x: 0.5, y: 1.3, w: 12, h: 0.9,
      fontFace: SERIF, fontSize: 28, color: INK,
    });
    const rd = shot("rug-detail");
    if (rd) {
      s.addImage({ path: rd, x: 0.5, y: 2.4, w: 8, h: 4.8, sizing: { type: "cover", w: 8, h: 4.8 } });
      s.addShape("rect", { x: 0.5, y: 2.4, w: 8, h: 4.8, fill: { color: INK, transparency: 100 }, line: { color: INK, width: 0.75 } });
    }
    s.addText("RugDescription block — typed fields", {
      x: 8.8, y: 2.5, w: 4.1, h: 0.4,
      fontFace: SANS, fontSize: 11, color: ACCENT, charSpacing: 3,
    });
    s.addText(
      "• lead (≤ 240 chars)\n• details (size, technique, materials, pile, knot density, age, condition)\n• colorPalette (hex chips + weight)\n• designFeatures + distinguishing\n• provenance (origin, region, verified flag)\n\nAI drafts. Editor verifies before publish. Unverified claims visibly flagged on the page.",
      { x: 8.8, y: 2.95, w: 4.1, h: 4.3, fontFace: SANS, fontSize: 11.5, color: "3A3A38" },
    );
  }

  // ── 9. five guardrails ───────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("Operational rules", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("Five rules. Codified. Enforced by tests.", {
      x: 0.5, y: 1.3, w: 12, h: 1.0,
      fontFace: SERIF, fontSize: 30, color: INK,
    });
    const rules = [
      ["01", "No prices, ever.", "Regex sweep over every AI output. Quoted only — visit, quote, wishlist."],
      ["02", "No fabricated inventory.", "Concierge can only name rugs returned by search_inventory; unknown ids → hand-off."],
      ["03", "No valuations or authenticity guarantees.", "Identification is always preliminary; routes to in-showroom appraisal."],
      ["04", "No risky DIY on valuable pieces.", "Silk / antique / natural-dye → professional handling, never household methods."],
      ["05", "Always a visible human exit.", "Phone numbers + book-a-visit on every AI surface and decision page."],
    ];
    rules.forEach((r, i) => {
      const y = 2.5 + i * 0.85;
      s.addText(r[0]!, { x: 0.7, y, w: 1, h: 0.6, fontFace: SANS, fontSize: 11, color: ACCENT, charSpacing: 4 });
      s.addText(r[1]!, { x: 1.7, y, w: 4.3, h: 0.6, fontFace: SANS, fontSize: 14, bold: true, color: INK });
      s.addText(r[2]!, { x: 6.2, y, w: 6.6, h: 0.6, fontFace: SANS, fontSize: 12, color: "3A3A38" });
    });
    s.addText("216 / 216 evals green. Gate before deploy.", {
      x: 0.7, y: 6.9, w: 12, h: 0.4,
      fontFace: SANS, fontSize: 11, color: MUTED, italic: true,
    });
  }

  // ── 10. architecture ─────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("Architecture", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("WordPress → modern React stack.", {
      x: 0.5, y: 1.3, w: 12, h: 1.0,
      fontFace: SERIF, fontSize: 30, color: INK,
    });
    const arch = [
      ["Framework", "WordPress + Avada theme", "Next.js 16 + React 19 + TypeScript"],
      ["Styling", "Theme CSS via PHP", "Tailwind 3 + design tokens"],
      ["CMS", "WordPress", "Headless — Sanity-ready (adapters wired)"],
      ["Hosting", "WP shared/managed", "Vercel edge + serverless"],
      ["Catalog", "WP custom post type", "Postgres + pgvector planned; fixtures in v1"],
      ["AI", "—", "Anthropic SDK · claude-sonnet-4-6 · vision"],
      ["Booking", "Manual / email", "Cal.com adapter"],
      ["Leads", "Email/contact form", "Consent-gated webhook + retention policy"],
    ];
    arch.forEach((row, i) => {
      const y = 2.5 + i * 0.5;
      s.addText(row[0]!, { x: 0.7, y, w: 1.8, h: 0.45, fontFace: SANS, fontSize: 12, bold: true, color: INK });
      s.addText(row[1]!, { x: 2.6, y, w: 4.6, h: 0.45, fontFace: SANS, fontSize: 12, color: MUTED });
      s.addText("→", { x: 7.2, y, w: 0.4, h: 0.45, fontFace: SANS, fontSize: 12, color: ACCENT });
      s.addText(row[2]!, { x: 7.6, y, w: 5.3, h: 0.45, fontFace: SANS, fontSize: 12, color: INK });
    });
  }

  // ── 11. performance + a11y ───────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("Performance & accessibility", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("Engineered for the budget.", {
      x: 0.5, y: 1.3, w: 12, h: 1.0,
      fontFace: SERIF, fontSize: 30, color: INK,
    });
    const perf = [
      ["LCP", "< 2.5s", "Hero priority-loaded; rest deferred."],
      ["CLS", "< 0.1", "Fixed-aspect frames per rug; no shifting."],
      ["INP", "< 200ms", "Concierge UI streams; doesn't block paint."],
      ["A11y", "WCAG 2.2 AA", "Skip-to-content; visible focus; alt text; reduced motion."],
      ["AEO", "JSON-LD", "Product, Service, FAQPage, Organization."],
      ["Images", "AVIF/WebP", "next/image, responsive sizes, locally mirrored."],
    ];
    perf.forEach((p, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.5 + col * 4.2;
      const y = 2.5 + row * 2.2;
      s.addShape("rect", { x, y, w: 4, h: 1.9, fill: { color: STONE }, line: { color: STONE } });
      s.addText(p[0]!, { x: x + 0.3, y: y + 0.2, w: 3.6, h: 0.5, fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4 });
      s.addText(p[1]!, { x: x + 0.3, y: y + 0.55, w: 3.6, h: 0.7, fontFace: SERIF, fontSize: 26, color: INK });
      s.addText(p[2]!, { x: x + 0.3, y: y + 1.25, w: 3.6, h: 0.7, fontFace: SANS, fontSize: 11, color: "3A3A38" });
    });
  }

  // ── 12. gaps ─────────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("Honest gaps", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("What the MVP is not yet.", {
      x: 0.5, y: 1.3, w: 12, h: 1.0,
      fontFace: SERIF, fontSize: 30, color: INK,
    });
    const gaps = [
      ["Catalog depth", "46 rugs vs hundreds live. Fixtures, not a real product DB."],
      ["Sanity provisioning", "Adapters wired; project not yet created."],
      ["Editor review queue UI", "Vision-classify is a markdown file today, not a Studio surface."],
      ["Custom domain", "Lives at isberian-site-qbj6.vercel.app, not a real domain."],
      ["Original photography", "Hero + rug images mirrored from upstream."],
      ["Years of journal content", "Three entries vs years of editorial. Migration plan TBD."],
      ["Phase 2 / Phase 3", "Room visualizer and trade portal designed, not built."],
    ];
    gaps.forEach((g, i) => {
      const y = 2.4 + i * 0.55;
      s.addText(g[0]!, { x: 0.7, y, w: 3.5, h: 0.5, fontFace: SANS, fontSize: 12, bold: true, color: INK });
      s.addText(g[1]!, { x: 4.4, y, w: 8.5, h: 0.5, fontFace: SANS, fontSize: 12, color: "3A3A38" });
    });
  }

  // ── 13. references with thumbnails ───────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("References", {
      x: 0.5, y: 0.9, w: 8, h: 0.5,
      fontFace: SANS, fontSize: 11, color: MUTED, charSpacing: 4,
    });
    s.addText("Where to look.", {
      x: 0.5, y: 1.3, w: 12, h: 1.0,
      fontFace: SERIF, fontSize: 30, color: INK,
    });
    const tiles: { name: string; label: string; url: string }[] = [
      { name: "home-hero", label: "Home", url: "https://isberian-site-qbj6.vercel.app" },
      { name: "rugs-grid", label: "Collection", url: "https://isberian-site-qbj6.vercel.app/rugs" },
      { name: "rug-detail", label: "Rug detail", url: "https://isberian-site-qbj6.vercel.app/rugs/imperial-medallion-kazak-1888-17109" },
      { name: "concierge-open", label: "Concierge", url: "https://isberian-site-qbj6.vercel.app/discover" },
      { name: "identify", label: "Identify a rug", url: "https://isberian-site-qbj6.vercel.app/identify" },
      { name: "services-triage", label: "Service triage", url: "https://isberian-site-qbj6.vercel.app/services/triage" },
    ];
    tiles.forEach((t, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.5 + col * 4.2;
      const y = 2.4 + row * 2.4;
      const p = shot(t.name);
      if (p) {
        s.addImage({ path: p, x, y, w: 4, h: 1.7, sizing: { type: "cover", w: 4, h: 1.7 }, hyperlink: { url: t.url } });
        s.addShape("rect", { x, y, w: 4, h: 1.7, fill: { color: INK, transparency: 100 }, line: { color: INK, width: 0.5 } });
      }
      s.addText(t.label, { x, y: y + 1.78, w: 4, h: 0.3, fontFace: SANS, fontSize: 12, bold: true, color: INK });
      s.addText(t.url.replace("https://", ""), { x, y: y + 2.05, w: 4, h: 0.3, fontFace: SANS, fontSize: 9, color: ACCENT, hyperlink: { url: t.url } });
    });
  }

  // ── 14. closer ───────────────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    const cn = shot("concierge-open");
    if (cn) {
      s.addImage({ path: cn, x: 0, y: 0, w: 13.33, h: 7.5, sizing: { type: "cover", w: 13.33, h: 7.5 } });
      s.addShape("rect", { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: INK, transparency: 25 }, line: { color: INK, transparency: 100 } });
    }
    s.addText("Same century. Same craft.", {
      x: 0.7, y: 2.6, w: 12, h: 0.6,
      fontFace: SANS, fontSize: 16, color: "C9C9C5", charSpacing: 4,
    });
    s.addText("A new front door.", {
      x: 0.7, y: 3.4, w: 12, h: 1.5,
      fontFace: SERIF, fontSize: 60, color: PAPER,
    });
    s.addText(
      "Conversation, vision, and a structured catalog — built around the five rules that make a hundred-year practice answerable online.",
      { x: 0.7, y: 5.0, w: 11, h: 1.5, fontFace: SANS, fontSize: 14, color: "A89E94" },
    );
  }

  return pres;
}

async function main() {
  const pres = makeDeck();
  const primary = path.resolve(process.cwd(), "isberian-mvp-comparison.pptx");
  let target = primary;
  try {
    await pres.writeFile({ fileName: target });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "EBUSY") {
      // File is open in PowerPoint — write to a versioned name instead so we never lose work.
      target = primary.replace(/\.pptx$/, `-v${Date.now()}.pptx`);
      await pres.writeFile({ fileName: target });
      console.warn(`Primary was locked by PowerPoint. Wrote to ${target} instead.`);
    } else {
      throw err;
    }
  }
  console.log(`Wrote ${target}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
