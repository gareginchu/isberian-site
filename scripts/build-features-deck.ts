/**
 * Builds a visual deck focused only on what the new site does that the
 * current isberian.com does NOT — i.e. the AI-native additions. Mirrors
 * the report in scripts/build-report.ts but designed for the room: one idea
 * per slide, a screenshot anchor, a plain headline, a short body.
 *
 *   pnpm tsx scripts/build-features-deck.ts
 *
 * Output: isberian-new-features-deck.pptx (in repo root)
 *
 * Run after `pnpm shots` so the screenshots referenced here exist.
 */
import PptxGenJS from "pptxgenjs";
import path from "node:path";
import { existsSync } from "node:fs";

const INK = "1F1F1E";
const MUTED = "6E6E6C";
const PAPER = "FAFAF8";
const STONE = "E2E2E2"; // legacy isberian.com body background — sampled live
const ACCENT = "570F12"; // legacy isberian.com link/label burgundy — sampled live

const SANS = "Calibri";
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

type FeatureSlide = {
  index: string;
  eyebrow: string;
  headline: string;
  shot: string;
  notes: { label: string; body: string }[];
};

const FEATURES: FeatureSlide[] = [
  {
    index: "01",
    eyebrow: "Conversation",
    headline: "Ask anything — front and centre.",
    shot: "concierge-open",
    notes: [
      {
        label: "What it does",
        body: "A single floating pill in the bottom-right corner of every page — home included. Type a question — about a rug, a room, care, or a visit. Answers in your voice, links to real rugs, offers to book a visit. The arrow button never grays out — the concierge always reads as awake and ready.",
      },
      {
        label: "Why it matters",
        body: "One door, not four. The home hero pill, the inline \"Talk to us\" section, and the dedicated discover page are all gone — the floating pill carries the load everywhere, so visitors never wonder which surface to use. Borrows the pattern people already know from ChatGPT and Perplexity. Catches the visitors who would have closed the tab silently, and routes them to a real conversation with the showroom.",
      },
      {
        label: "Will never",
        body: "Quote a price. Invent a rug. Recommend bleach on silk. Each enforced by automated tests that block deployment.",
      },
    ],
  },
  {
    index: "02",
    eyebrow: "Vision",
    headline: "Identify a rug from photos.",
    shot: "identify",
    notes: [
      {
        label: "What it does",
        body: "Visitor uploads photos. Vision returns a preliminary read — origin, age band, type — with confidence, plus what it can't tell from photos alone. Offers an appraisal at the showroom.",
      },
      {
        label: "Why it matters",
        body: "People with old or inherited rugs land on Reddit today. Here they land in your booking flow.",
      },
      {
        label: "Will never",
        body: "Give a valuation. Guarantee authenticity. Definitive identification happens in person.",
      },
    ],
  },
  {
    index: "03",
    eyebrow: "Vision",
    headline: "Service triage from a photo.",
    shot: "services-triage",
    notes: [
      {
        label: "What it does",
        body: "Photos of damage + a short note. Returns issue, severity band (light → specialist-only), and next step: drop-off, house call, ship-in, or in-showroom inspection.",
      },
      {
        label: "Why it matters",
        body: "Turns \"I have a problem\" into a booked service inquiry without making the visitor wait for someone to call back.",
      },
      {
        label: "Will never",
        body: "Recommend DIY on antique or silk pieces. Those route to a specialist, always.",
      },
    ],
  },
  {
    index: "04",
    eyebrow: "Augmented reality",
    headline: "See the rug in your room.",
    shot: "rug-detail",
    notes: [
      {
        label: "What it does",
        body: "Every rug in the catalog — all 49 — becomes a 3D object on its page, with a toolbar to zoom, reset, auto-rotate, and view fullscreen. A QR code beside it opens AR on the visitor's phone at true scale. iPhone and Android both. No app to install.",
      },
      {
        label: "Why it matters",
        body: "Size is the one thing a photo cannot communicate. AR is the most direct answer to \"will this fit my room?\" you can give online. A size verifier asserts every 3D plane matches the rug's real dimensions within one percent. The detail page itself is built to keep the rug visible: the lead paragraph sits at editorial size, the image locks in place the instant you start scrolling and holds perfectly still as the text moves past, and the floating concierge holds its corner without crowding the photo.",
      },
      {
        label: "Where the QR lives",
        body: "On the rug's detail page — and printed on a card next to the rug in the showroom, so visitors walking the floor can scan and see it at home before they leave.",
      },
    ],
  },
  {
    index: "05",
    eyebrow: "Visual similarity",
    headline: "More like this — by eye, not by tag.",
    shot: "rugs-grid",
    notes: [
      {
        label: "What it does",
        body: "Four similar rugs at the bottom of each detail page — chosen by what the AI sees in the photo (palette, weave, era), not by category.",
      },
      {
        label: "Why it matters",
        body: "Today's site browses by category. People shop for rugs by visual instinct. This unlocks a path through the collection they didn't have.",
      },
    ],
  },
  {
    index: "06",
    eyebrow: "Catalog model",
    headline: "Every rug, described the same way.",
    shot: "rug-detail",
    notes: [
      {
        label: "What it does",
        body: "Forty-nine rugs, each rendered the same way: SKU eyebrow (\"No. 17600\"), description, 3D viewer, a suggested-setting room, a four-scene lifestyle row, and a structured block — lead, technical details, color palette as actual chips, design features, distinguishing notes, provenance. Sizes, origins, and materials are ingested from the upstream inventory; AI drafts the prose; editor verifies before publish. The lifestyle scenes know their rug: runners get long foyers, staircases, gallery hallways, and galley kitchens — not dining tables and bedrooms. Every scene is generated with the rug's real dimensions baked into the prompt, so the AI cannot quietly resize the piece to fit the room.",
      },
      {
        label: "Familiar collection page",
        body: "The /rugs grid now mirrors the legacy clearance-page layout — search bar, sort dropdown, per-page dropdown, paginator arrows top and bottom (« ‹ Page X of Y › »), collapsible filter groups, a \"Your Selections\" summary at the top. Returning customers' muscle memory still works.",
      },
      {
        label: "Why it matters",
        body: "The burgundy is back — the signature #570F12 from the old isberian.com lives again in eyebrows, links, field labels, and the Clear button. The navbar carries the same register on every interior page: pale cool gray background, dark logo, dark text, burgundy hover — visitors recognize the brand from the navbar alone, just as they did on the old site. And structured data is what makes Isberian appear inside answers from search engines and AI assistants like ChatGPT.",
      },
    ],
  },
  {
    index: "07",
    eyebrow: "Editorial",
    headline: "Edit the catalog from your browser.",
    shot: "rug-detail",
    notes: [
      {
        label: "What it does",
        body: "The catalog lives in a hosted editorial workspace (Sanity). Sign in, change a description, change a price status, swap an image — the public site reflects it within about thirty seconds. No developer, no deploy, no commit.",
      },
      {
        label: "Why it matters",
        body: "Editorial control sits with the showroom, not engineering. The structured description rules still apply: AI drafts, an editor verifies origin / age / knot count before anything goes live.",
      },
      {
        label: "Two ways in",
        body: "The standard editor at sanity.io, or a quiet in-house surface at /curator on the site itself — same content, two doors.",
      },
    ],
  },
  {
    index: "08",
    eyebrow: "Care knowledge",
    headline: "A knowledge base behind every care answer.",
    shot: "care",
    notes: [
      {
        label: "What it does",
        body: "The concierge does not improvise on care. Every care or material answer is pulled from a curated knowledge base. Antique, silk, or valuable pieces always route to professional service.",
      },
      {
        label: "Why it matters",
        body: "The most damaging AI failure is confident advice that ruins a rug. The knowledge base prevents that — the silk / antique / valuable filter is non-negotiable in code.",
      },
    ],
  },
];

function makeDeck() {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Oscar Isberian Rugs — What's new in the new site";
  pres.author = "Isberian site team";

  pres.defineSlideMaster({
    title: "BASE",
    background: { color: PAPER },
    objects: [
      {
        text: {
          text: "Oscar Isberian Rugs · What the new site adds",
          options: {
            x: 0.5,
            y: 0.3,
            w: 8,
            h: 0.3,
            fontFace: SANS,
            fontSize: 9,
            color: MUTED,
            charSpacing: 3,
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
      s.addImage({
        path: hero,
        x: 0,
        y: 0,
        w: 13.33,
        h: 7.5,
        sizing: { type: "cover", w: 13.33, h: 7.5 },
      });
      s.addShape("rect", {
        x: 0,
        y: 0,
        w: 13.33,
        h: 7.5,
        fill: { color: INK, transparency: 30 },
        line: { color: INK, transparency: 100 },
      });
    }
    s.addText("OSCAR ISBERIAN RUGS · CHICAGO SINCE 1920", {
      x: 0.7,
      y: 2.2,
      w: 12,
      h: 0.4,
      fontFace: SANS,
      fontSize: 11,
      color: "C9C9C5",
      charSpacing: 5,
    });
    s.addText("What the new site does", {
      x: 0.7,
      y: 2.7,
      w: 12,
      h: 1.0,
      fontFace: SERIF,
      fontSize: 56,
      color: PAPER,
    });
    s.addText("that the current site doesn't.", {
      x: 0.7,
      y: 3.6,
      w: 12,
      h: 1.0,
      fontFace: SERIF,
      fontSize: 56,
      color: PAPER,
      italic: true,
    });
    s.addText(
      "A visual tour of the AI-native additions in the new site — written for the showroom, not engineers.",
      {
        x: 0.7,
        y: 5.0,
        w: 11,
        h: 1.0,
        fontFace: SANS,
        fontSize: 16,
        color: "A89E94",
      },
    );
    s.addText("June 2026", {
      x: 0.7,
      y: 6.7,
      w: 6,
      h: 0.3,
      fontFace: SANS,
      fontSize: 10,
      color: MUTED,
      charSpacing: 4,
    });
  }

  // ── 2. opener: same century, new front door ─────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("In short", {
      x: 0.5,
      y: 0.9,
      w: 8,
      h: 0.5,
      fontFace: SANS,
      fontSize: 11,
      color: ACCENT,
      charSpacing: 4,
    });
    s.addText("Same century. Same craft. A new front door.", {
      x: 0.5,
      y: 1.4,
      w: 12,
      h: 1.4,
      fontFace: SERIF,
      fontSize: 40,
      color: INK,
    });
    s.addText(
      "Heritage, voice, two showrooms, quoted-only model — unchanged. What's different is what happens before the visitor calls the showroom: a conversation, a camera, and a catalog machines can read.",
      {
        x: 0.5,
        y: 3.0,
        w: 12,
        h: 1.6,
        fontFace: SERIF,
        fontSize: 20,
        color: "3A3A38",
      },
    );
    s.addText("Every feature in this deck routes back to a person.", {
      x: 0.5,
      y: 4.8,
      w: 12,
      h: 0.6,
      fontFace: SANS,
      fontSize: 16,
      color: ACCENT,
      italic: true,
    });
    s.addText("On the next pages — eight additions, one per page.", {
      x: 0.5,
      y: 6.6,
      w: 12,
      h: 0.4,
      fontFace: SANS,
      fontSize: 11,
      color: MUTED,
      charSpacing: 3,
    });
  }

  // ── 3..N. one slide per feature ─────────────────────────────────────
  for (const f of FEATURES) {
    const s = pres.addSlide({ masterName: "BASE" });

    // eyebrow row
    s.addText(`FEATURE ${f.index}  ·  ${f.eyebrow.toUpperCase()}`, {
      x: 0.5,
      y: 0.9,
      w: 8,
      h: 0.4,
      fontFace: SANS,
      fontSize: 11,
      color: ACCENT,
      charSpacing: 4,
    });

    // headline
    s.addText(f.headline, {
      x: 0.5,
      y: 1.35,
      w: 12.3,
      h: 1.0,
      fontFace: SERIF,
      fontSize: 32,
      color: INK,
    });

    // screenshot
    const img = shot(f.shot);
    if (img) {
      s.addImage({
        path: img,
        x: 0.5,
        y: 2.6,
        w: 7.6,
        h: 4.5,
        sizing: { type: "cover", w: 7.6, h: 4.5 },
      });
      s.addShape("rect", {
        x: 0.5,
        y: 2.6,
        w: 7.6,
        h: 4.5,
        fill: { color: INK, transparency: 100 },
        line: { color: INK, width: 0.5 },
      });
    } else {
      s.addShape("rect", {
        x: 0.5,
        y: 2.6,
        w: 7.6,
        h: 4.5,
        fill: { color: STONE },
        line: { color: STONE },
      });
      s.addText("(screenshot pending — run pnpm shots)", {
        x: 0.5,
        y: 4.7,
        w: 7.6,
        h: 0.4,
        fontFace: SANS,
        fontSize: 10,
        color: MUTED,
        align: "center",
        italic: true,
      });
    }

    // notes column on the right
    f.notes.forEach((n, i) => {
      const y = 2.7 + i * 1.55;
      s.addText(n.label.toUpperCase(), {
        x: 8.4,
        y,
        w: 4.4,
        h: 0.35,
        fontFace: SANS,
        fontSize: 10,
        color: ACCENT,
        charSpacing: 4,
      });
      s.addText(n.body, {
        x: 8.4,
        y: y + 0.35,
        w: 4.4,
        h: 1.15,
        fontFace: SANS,
        fontSize: 11,
        color: "3A3A38",
      });
    });
  }

  // ── Five rules slide ─────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("FEATURE 09  ·  OPERATIONS", {
      x: 0.5,
      y: 0.9,
      w: 8,
      h: 0.4,
      fontFace: SANS,
      fontSize: 11,
      color: ACCENT,
      charSpacing: 4,
    });
    s.addText("Five rules, codified.", {
      x: 0.5,
      y: 1.35,
      w: 12,
      h: 1.0,
      fontFace: SERIF,
      fontSize: 32,
      color: INK,
    });
    s.addText("These match how Isberian has always worked. What's new is that they are tests, not policy documents.", {
      x: 0.5,
      y: 2.3,
      w: 12.3,
      h: 0.6,
      fontFace: SANS,
      fontSize: 14,
      color: "3A3A38",
      italic: true,
    });
    const rules: [string, string, string][] = [
      ["01", "No prices, ever.", "Quotes only. Regex sweep over every AI output blocks any leak."],
      ["02", "No fabricated inventory.", "The concierge can only name rugs that exist in the catalog."],
      ["03", "No valuations online.", "Identification is preliminary; routes to in-person appraisal."],
      ["04", "No risky DIY.", "Silk / antique / natural-dye → specialist, never household methods."],
      ["05", "Always a visible human exit.", "Phone numbers + book-a-visit on every AI surface."],
    ];
    rules.forEach((r, i) => {
      const y = 3.2 + i * 0.7;
      s.addText(r[0], {
        x: 0.7,
        y,
        w: 0.8,
        h: 0.5,
        fontFace: SANS,
        fontSize: 11,
        color: ACCENT,
        charSpacing: 4,
      });
      s.addText(r[1], {
        x: 1.6,
        y,
        w: 4.5,
        h: 0.5,
        fontFace: SANS,
        fontSize: 14,
        bold: true,
        color: INK,
      });
      s.addText(r[2], {
        x: 6.3,
        y,
        w: 6.5,
        h: 0.5,
        fontFace: SANS,
        fontSize: 12,
        color: "3A3A38",
      });
    });
    s.addText("A change that lets the concierge slip a price into an answer automatically blocks deployment.", {
      x: 0.7,
      y: 6.9,
      w: 12,
      h: 0.4,
      fontFace: SANS,
      fontSize: 11,
      color: MUTED,
      italic: true,
    });
  }

  // ── Performance + SEO slide ──────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: "BASE" });
    s.addText("FEATURE 10  ·  REACH", {
      x: 0.5,
      y: 0.9,
      w: 8,
      h: 0.4,
      fontFace: SANS,
      fontSize: 11,
      color: ACCENT,
      charSpacing: 4,
    });
    s.addText("Built to be found, and to be fast.", {
      x: 0.5,
      y: 1.35,
      w: 12,
      h: 1.0,
      fontFace: SERIF,
      fontSize: 32,
      color: INK,
    });
    const perf: [string, string, string][] = [
      ["LCP", "< 2.5s", "Hero loads first. Everything else defers."],
      ["CLS", "< 0.1", "No layout shift while you're reading."],
      ["INP", "< 200ms", "Concierge UI never blocks paint."],
      ["A11y", "WCAG 2.2 AA", "Screen reader, keyboard, reduced motion."],
      ["AEO", "JSON-LD", "Product, Service, FAQ, LocalBusiness."],
      ["Images", "AVIF/WebP", "Responsive, lazy, locally mirrored."],
    ];
    perf.forEach((p, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.5 + col * 4.2;
      const y = 2.7 + row * 2.2;
      s.addShape("rect", {
        x,
        y,
        w: 4,
        h: 1.9,
        fill: { color: STONE },
        line: { color: STONE },
      });
      s.addText(p[0], {
        x: x + 0.3,
        y: y + 0.2,
        w: 3.6,
        h: 0.5,
        fontFace: SANS,
        fontSize: 11,
        color: MUTED,
        charSpacing: 4,
      });
      s.addText(p[1], {
        x: x + 0.3,
        y: y + 0.55,
        w: 3.6,
        h: 0.7,
        fontFace: SERIF,
        fontSize: 26,
        color: INK,
      });
      s.addText(p[2], {
        x: x + 0.3,
        y: y + 1.25,
        w: 3.6,
        h: 0.7,
        fontFace: SANS,
        fontSize: 11,
        color: "3A3A38",
      });
    });
    s.addText(
      "These shape whether visitors arrive — and whether AI assistants like ChatGPT name Isberian when asked.",
      {
        x: 0.5,
        y: 6.9,
        w: 12,
        h: 0.4,
        fontFace: SANS,
        fontSize: 11,
        color: MUTED,
        italic: true,
      },
    );
  }

  // ── Closer ───────────────────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    const cn = shot("concierge-open");
    if (cn) {
      s.addImage({
        path: cn,
        x: 0,
        y: 0,
        w: 13.33,
        h: 7.5,
        sizing: { type: "cover", w: 13.33, h: 7.5 },
      });
      s.addShape("rect", {
        x: 0,
        y: 0,
        w: 13.33,
        h: 7.5,
        fill: { color: INK, transparency: 22 },
        line: { color: INK, transparency: 100 },
      });
    }
    s.addText("THE SHOWROOM IS STILL THE ANSWER", {
      x: 0.7,
      y: 2.5,
      w: 12,
      h: 0.5,
      fontFace: SANS,
      fontSize: 14,
      color: "C9C9C5",
      charSpacing: 5,
    });
    s.addText("A new front door.", {
      x: 0.7,
      y: 3.1,
      w: 12,
      h: 1.5,
      fontFace: SERIF,
      fontSize: 64,
      color: PAPER,
    });
    s.addText(
      "Conversation, vision, augmented reality, and a structured catalog. The visitor still ends up where they should — in front of you, with a rug, with their question, in person.",
      {
        x: 0.7,
        y: 4.8,
        w: 11,
        h: 1.8,
        fontFace: SANS,
        fontSize: 16,
        color: "A89E94",
      },
    );
  }

  return pres;
}

async function main() {
  const pres = makeDeck();
  const primary = path.resolve(process.cwd(), "isberian-new-features-deck.pptx");
  let target = primary;
  try {
    await pres.writeFile({ fileName: target });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "EBUSY") {
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
