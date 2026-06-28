/**
 * Builds a professional, plain-language specification document for the new
 * Oscar Isberian Rugs site. Audience: showroom ownership, consultants,
 * future engineering partners — not internal developers. Avoids code,
 * favors concrete behavior, what/why/safety/acceptance per feature.
 *
 *   pnpm tsx scripts/build-spec.ts
 *
 * Output: isberian-new-site-specification.docx (in repo root)
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageOrientation,
  Footer,
  Header,
  PageNumber,
  LevelFormat,
  convertInchesToTwip,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  TableOfContents,
  PageBreak,
} from "docx";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const INK = "1F1F1E";
const MUTED = "6E6E6C";
const SOFT = "8E8E8B";
const ACCENT = "6B1F1A";
const STONE = "F1F1EE";

function eyebrow(text: string) {
  return new Paragraph({
    spacing: { before: 280, after: 80 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: "Calibri",
        size: 16,
        characterSpacing: 60,
        color: ACCENT,
      }),
    ],
  });
}

function h1(text: string, opts: { pageBreakBefore?: boolean } = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: opts.pageBreakBefore ? 0 : 360, after: 200 },
    pageBreakBefore: opts.pageBreakBefore ?? false,
    children: [new TextRun({ text, font: "Georgia", size: 48, color: INK })],
  });
}

function h2(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    keepNext: true,
    children: [new TextRun({ text, font: "Georgia", size: 28, color: INK })],
  });
}

function h3(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 80 },
    keepNext: true,
    children: [new TextRun({ text, font: "Calibri", size: 22, bold: true, color: INK })],
  });
}

function body(text: string) {
  return new Paragraph({
    spacing: { before: 0, after: 160, line: 300 },
    children: [new TextRun({ text, font: "Calibri", size: 22, color: INK })],
  });
}

function labeled(label: string, text: string) {
  return new Paragraph({
    spacing: { before: 0, after: 120, line: 300 },
    children: [
      new TextRun({ text: `${label}  `, font: "Calibri", size: 22, bold: true, color: INK }),
      new TextRun({ text, font: "Calibri", size: 22, color: "3A3A38" }),
    ],
  });
}

function bullet(text: string, level: 0 | 1 = 0) {
  return new Paragraph({
    spacing: { before: 0, after: 80, line: 280 },
    numbering: { reference: "spec-bullets", level },
    children: [new TextRun({ text, font: "Calibri", size: 22, color: "3A3A38" })],
  });
}

function rule() {
  return new Paragraph({
    spacing: { before: 280, after: 280 },
    border: { bottom: { color: "C9C9C5", space: 4, style: BorderStyle.SINGLE, size: 4 } },
    children: [],
  });
}

function muted(text: string) {
  return new Paragraph({
    spacing: { before: 0, after: 160, line: 280 },
    children: [
      new TextRun({ text, font: "Calibri", size: 20, color: SOFT, italics: true }),
    ],
  });
}

/** Two-column table — first column label, second column body. */
function kvTable(rows: [string, string][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "C9C9C5" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "C9C9C5" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E5E5E1" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: rows.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 80, right: 80 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: k, font: "Calibri", size: 21, bold: true, color: INK })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 80, right: 80 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: v, font: "Calibri", size: 21, color: "3A3A38" })],
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

/** Feature block — what / why / never / acceptance, with an eyebrow + section heading. */
function featureBlock(opts: {
  index: string;
  eyebrow: string;
  name: string;
  what: string;
  why: string;
  never?: string;
  acceptance: string[];
}) {
  return [
    rule(),
    eyebrow(`${opts.index} · ${opts.eyebrow}`),
    h2(opts.name),
    labeled("What it is.", opts.what),
    labeled("Why it matters.", opts.why),
    ...(opts.never ? [labeled("What it will never do.", opts.never)] : []),
    new Paragraph({
      spacing: { before: 120, after: 80 },
      children: [
        new TextRun({ text: "Acceptance criteria.", font: "Calibri", size: 22, bold: true, color: INK }),
      ],
    }),
    ...opts.acceptance.map((a) => bullet(a)),
  ];
}

function buildDoc() {
  const children: (Paragraph | Table)[] = [];

  // ── Cover ────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      spacing: { before: 1400, after: 80 },
      children: [
        new TextRun({
          text: "OSCAR ISBERIAN RUGS",
          font: "Calibri",
          size: 18,
          characterSpacing: 80,
          color: MUTED,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: "New site", font: "Georgia", size: 64, color: INK })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 360 },
      children: [
        new TextRun({ text: "specification.", font: "Georgia", size: 64, color: INK, italics: true }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: "A plain-language specification of the new Oscar Isberian Rugs website — its purpose, features, editorial rules, and the criteria by which each part is judged complete.",
          font: "Calibri",
          size: 24,
          color: MUTED,
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 240, after: 80 },
      children: [
        new TextRun({ text: "Version 1.0   ·   June 2026", font: "Calibri", size: 18, color: MUTED, characterSpacing: 40 }),
      ],
    }),
    rule(),
  );

  // ── 1. Purpose ───────────────────────────────────────────────────────
  children.push(
    eyebrow("Section 1"),
    h1("Purpose"),
    body(
      "This site exists to do online what the showrooms already do in person: present a century-old rug practice with care, route serious buyers to a real conversation, and make the catalog answerable to anyone who asks — including search engines and AI assistants. Heritage, voice, quoted-only commerce, and showroom-first selling are unchanged. What changes is the front door — instead of a static catalog and a contact form, the visitor meets a conversation, a camera, and a structured catalog machines can read.",
    ),
    h3("North star"),
    body(
      "A buyer asking an AI assistant for an antique Heriz dealer in Chicago can be surfaced to Isberian, and a real human visit can be booked from any rug page within two taps. Crawlable content, grounded conversation, and a visible booking path — that is the bar.",
    ),
    h3("Success looks like"),
    bullet("Increased qualified showroom visits — measurable through Cal.com bookings tied to specific rug pages or concierge transcripts."),
    bullet("Inbound from AI assistants — Isberian named inside answers from ChatGPT, Perplexity, and Google's AI overviews on rug-related queries."),
    bullet("Service inquiries with photos and a triage band attached before any human picks up the phone."),
    bullet("Editorial control retained — every AI-drafted page reviewed and approved by a human before publish."),
    bullet("No customer support calls created by the site itself — anything the AI can't answer routes back to a person, not a bad guess."),
  );

  // ── 2. Audience ──────────────────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Section 2"),
    h1("Audience"),
    body("Four readers. The site speaks to each one differently."),
    h3("The retail buyer."),
    body(
      "Often furnishing a single room. May know rugs well or barely at all. Most decisive factor: will it look right in my room, and at what size? Wants a clear path to a quote and a visit, not a price tag.",
    ),
    h3("The interior designer and trade partner."),
    body(
      "Sourcing for a client. Needs to filter the catalog quickly by size, palette, era, and origin. Cares about provenance and verifiability. Asks specific questions that benefit from a knowledgeable interlocutor.",
    ),
    h3("The rug owner with a question."),
    body(
      "Already owns a rug — inherited, found, bought elsewhere. Comes in looking to identify it, value it, clean it, or restore it. Often arrives via a Google search like \"what is my Persian rug.\" This audience is large and was not previously routed into the showroom's funnel.",
    ),
    h3("The AI assistant."),
    body(
      "A non-human reader — ChatGPT, Claude, Gemini, Perplexity, Google AI overviews — that increasingly answers buyers' questions directly. To be cited inside those answers, the site must publish structured, crawlable, verifiable content. Treating this reader as a first-class audience is what makes Isberian appear in the answers, not just the search results.",
    ),
  );

  // ── 3. Site map ──────────────────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Section 3"),
    h1("Site map"),
    body("Every page below is server-rendered, crawlable, and labelled. Pages marked AI surface contain assistant features behind editorial guardrails."),
  );
  children.push(
    kvTable([
      ["Home", "Hero carousel renders on its own — no overlay pill, no inline concierge block. The single floating concierge surface lives in the lower-right of the viewport on this page just like every other route. Below the carousel: action tiles, Rugs by style, Step-by-step, Repair and restoration, Showrooms, Press, Newsletter."],
      ["Rugs (collection)", "Server-rendered clearance-style page that mirrors the legacy isberian.com layout. Left sidebar holds a search input, a \"Your Selections\" panel with removable × chips and a Clear button, and four collapsible facet groups (By Styles, By Color, By Size, By Origin) each with a +/- toggle. Right column carries a \"Search results · X pieces\" header, a Sort by dropdown (Newest, Title A→Z, Title Z→A, Size small→large, Size large→small), a Per page dropdown (12 / 24 / 50), the rug grid, and a bottom « ‹ Page X of Y › » pagination row that is fully server-rendered as <Link>s — preserves every other query param and only updates ?page, with first/last disabled state rendered as <span>s so they are not keyboard-tab-targets. Every control writes to the URL — q, sort, perPage, page, and facet params — so any filtered view is shareable, bookmarkable, and visible to crawlers with JavaScript off. Each card carries the SKU eyebrow (\"No. 17600\") above the title."],
      ["Rug detail", "Two-column layout on desktop. The image column is sticky at lg:top-40 (160px) — chosen to match the interior-page sticky header (48px top utility strip plus the 111px main row) so the photograph's natural top sits at the lock position on initial render and the sticky behavior catches it from the first pixel of scroll, with no initial movement. There is no standalone breadcrumb row above the grid; the \"← The collection\" breadcrumb has moved into the right column, above the title eyebrow. The photograph itself is capped at min(75vh, 720px) so a single image cannot dominate the viewport. Right column reading order: breadcrumb, SKU eyebrow (the legacy \"No. 17600\" form — internal IDs strip the rug- prefix), title, structured description block, inline 3D viewer with toolbar and AR (QR code beside it), suggested-setting render, four-scene lifestyle row, request-a-quote form, similar rugs, human exit."],
      ["Identify (AI surface)", "Vision-based rug identification with confidence levels and an explicit \"preliminary\" framing. Books an appraisal."],
      ["Services and Services / Triage", "Cleaning and restoration overview; Triage is a vision-based service intake — upload photos of damage, receive issue, severity band, and next step."],
      ["Custom", "Custom and commission program."],
      ["Trade", "Trade-program landing, contact form. (Trade portal is Phase 2.)"],
      ["Story / Journal", "Heritage editorial and longer-form pieces."],
      ["Visit", "Showroom hours, addresses, parking, and booking."],
      ["Care knowledge base", "Curated entries — materials, antique handling, common stains, between-cleanings care. Grounding source for the concierge."],
      ["Contact", "Phone numbers, email, addresses, hours."],
      ["Curator (/curator)", "Unlisted in-app editor surface that writes through to the CMS. Robots-blocked, not linked from anywhere. A convenience tool for quick edits; Sanity Studio remains the primary editor."],
    ]),
  );

  // ── 4. Brand, voice, editorial rules ─────────────────────────────────
  children.push(
    rule(),
    eyebrow("Section 4"),
    h1("Brand, voice, and editorial rules"),
    h3("Voice"),
    body(
      "A master dealer with a century of family heritage. Warm, precise, unhurried. Never pushy. Never falsely certain. Provenance and story over hype. Specificity over superlative — \"a 9'2\" × 12'4\" hand-knotted Heriz, c. 1900, with apricot spandrels\" reads richer than \"an exquisite masterpiece.\" No emoji. No exclamations.",
    ),
    h3("Imagery"),
    body(
      "Photography is the hero. Hero, category tiles, and rug product photos all live in a single image pipeline that produces responsive, modern-format, lazy-loaded images. Every image has descriptive alt text — not decorative — because it serves both accessibility and AI parsing. Every rug emits its own social-share image rendered with the rug at the center, never a brand logo.",
    ),
    h3("Palette"),
    body(
      "Ink (near-black) for body text, stone (warm off-white) for surfaces, and oxblood — the heritage burgundy #570F12 sampled from the legacy isberian.com link and label color — as the single accent. The accent carries field labels in the rug-detail Details block, link affordances, and the eyebrow lettering throughout the editorial system. Heritage over discount: red \"sale\" styling is never used as a primary accent or CTA color. Clearance is a tab, never the brand's opening line.",
    ),
    h3("Navbar register"),
    body(
      "The header is rendered in two registers. On the home page it overlays the hero carousel — background transparent, logo and primary nav text rendered in cream, dropdowns transparent with a backdrop blur — so the imagery reads through unobstructed. On every other route the header sits on a warm stone surface (#E2E2E2, sampled live from isberian.com/clearance/) with dark ink primary nav text and the dark logo; the top utility strip sits on a slightly lighter stone-100 with a stone-200 bottom border; dropdown panels open on white with a hairline ring-1 ring-ink/5 and a stone-100 hover background. Hover state throughout — both registers — turns text oxblood. The split lets the home page feel cinematic without giving up the brand's quieter, gallery-like register everywhere else.",
    ),
    h3("The five rules"),
    body("These match how Isberian has always worked. The new site enforces each in code — they are not a policy document, they are tests that block deployment when broken."),
    bullet("No prices, ever. Quotes only. Every AI output is regex-swept before delivery; any dollar amount is blocked."),
    bullet("No fabricated inventory. The concierge can only name rugs returned by a live search of the catalog. Any reference to an unknown rug routes to a human."),
    bullet("No valuations or authenticity guarantees online. Identification is preliminary and always routes to an in-person appraisal."),
    bullet("No risky DIY on valuable, antique, or silk rugs. Care suggestions for such pieces always route to professional service."),
    bullet("Always a visible human exit. Phone numbers, addresses, and book-a-visit are present on every AI surface and decision page."),
  );

  // ── 5. Functional features ───────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Section 5"),
    h1("Functional features"),
    body(
      "Each feature below specifies what it is, why it matters, what it will never do, and the conditions under which the feature is considered complete and shippable.",
    ),
  );

  children.push(
    ...featureBlock({
      index: "5.1",
      eyebrow: "Catalog",
      name: "Browseable collection grid",
      what: "The /rugs page is the canonical browse surface and matches the structure of the legacy isberian.com clearance page so existing buyers, designers, and trade partners encounter a familiar layout. Two columns. The sidebar (left) holds a search input, a \"Your Selections\" panel that shows every active filter as a removable × chip alongside a Clear button, and four collapsible facet groups labelled By Styles, By Color, By Size, and By Origin — each opens and closes via a +/- toggle. The main column (right) carries a \"Search results · X pieces\" header, a Sort by dropdown (Newest, Title A→Z, Title Z→A, Size small→large, Size large→small), a Per page dropdown (12 / 24 / 50), the rug grid itself, and a « ‹ Page X of Y › » pagination row at the bottom. The bottom pagination row is fully server-rendered — every arrow and every page link is an actual <Link>, preserving every other query parameter (q, sort, perPage, and the facet params) and only updating ?page, so the row works with JavaScript off and the URL stays canonical. The disabled first/last states render as <span>s, not links, so they are skipped by keyboard-tab navigation. The top-of-grid control set (RugGridControls.tsx) is the client equivalent and remains the interactive sibling of the bottom row. Every card shows the rug photograph, the SKU as an eyebrow above the title (\"No. 17600\"), origin, size, and a status badge (available, on memo, sold). At v1 the catalog holds 49 pieces, all of which clear the 3D-readiness bar (verifiable dimensions, clean photography, no fringe or carving issues that throw the model).",
      why: "The catalog is the spine of the site. Search engines and AI assistants need to discover and index real inventory. Designers and trade partners need to scan quickly. Retail buyers need a clean browse path. Matching the legacy clearance-page structure means muscle memory carries over for returning visitors, and every interaction is encoded in the URL — q, sort, perPage, page, and the facet params — so any filtered or sorted view is shareable, bookmarkable, and visible to a crawler with JavaScript turned off. The SKU eyebrow matches the showroom's own language for a rug and lets staff and visitors refer to the same piece without ambiguity.",
      never: "Show a price, an estimate, a \"from $...\" anywhere on a card or detail page. Status is the only commercial signal exposed.",
      acceptance: [
        "Grid, search, sort, per-page, pagination, and facets all render in initial HTML — a `curl` of any URL with JavaScript disabled returns the correct, fully filtered result set.",
        "The bottom pagination row renders as « ‹ Page X of Y › » with every active control as a real <Link> that preserves q, sort, perPage, and facet params and only updates ?page; disabled first/last states render as <span>s so they are not keyboard-tab-targets.",
        "Each card emits Product JSON-LD with at least: name, brand (Oscar Isberian Rugs), image, identifier (SKU).",
        "Every control (search, sort, per-page, page, facet group) writes to the URL so the resulting view is shareable and bookmarkable.",
        "Active facets appear as removable chips in the \"Your Selections\" panel, and Clear empties them in one click.",
        "The SKU eyebrow appears on every rug surface — card, detail page, and the Visualizer's \"Selected piece\" header.",
        "No price field exists in any catalog record at any layer.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.2",
      eyebrow: "Catalog",
      name: "Structured rug detail page",
      what: "Two-column layout on desktop. The image column is sticky and anchored at lg:top-40 (160px) — chosen to match the interior-page sticky header height exactly (a 48px top utility strip plus the 111px main row) so the image's natural top sits at the lock position on the first render and the sticky behavior catches it from the first pixel of scroll. There is no initial movement, no jump, no settling. The standalone breadcrumb row above the grid has been retired; the \"← The collection\" breadcrumb now lives at the top of the right column, above the SKU eyebrow, which is what removes the height that would otherwise push the image below its lock line. The rug photograph stays visible while the right column scrolls through the description, the 3D viewer + AR + QR, the request-a-quote form, and the human exit. The photograph is capped at min(75vh, 720px) so a single image can never dominate the viewport. The right column begins with the breadcrumb, then a \"No. xxxxx\" SKU eyebrow — the internal rug- prefix is stripped at render so the displayed SKU matches the legacy convention (a number, no namespace). Below the title runs a one-line lead set at editorial body weight (text-base on mobile, text-lg on desktop, in the body sans rather than display serif), then the structured Details block (size, technique, materials, pile, knot density if verified, age if verified, condition) where field labels render in oxblood — the heritage burgundy — against gray values, matching the legacy \"Item Number: / Origin: / Size: / Material:\" pattern. Then color palette as actual color chips with editorial names, design features, distinguishing notes, and provenance. AI drafts each field from photos and attributes; an editor verifies anything about origin, age, or knot count before publish. Unverified claims remain visibly flagged as preliminary.",
      why: "Free prose varies wildly and is hard to compare. Structured data lets every rug be answerable by visitors, search engines, and AI assistants in the same way. The sticky image column keeps the photograph — the most decisive piece of information — in view while the visitor reads. Aligning the lock position to the actual rendered header height is what makes the lock feel instant — any other value (the prior lg:top-32, for instance) leaves the image starting a few pixels above its lock line, and the first scroll movement shows a brief drift before the sticky behavior engages. Moving the breadcrumb into the right column is the other half of that fix: it removes the row above the grid that otherwise pushes the image down. The legacy SKU form and oxblood field labels carry forward the showroom's existing visual language so returning visitors are not learning a second dialect. The editor-verify discipline makes the editorial rule \"never claim what we can't verify\" enforceable by the schema itself.",
      acceptance: [
        "All catalog rugs render the full structured description block.",
        "On desktop, the image column is sticky at lg:top-40 (160px). The image's natural top sits at the lock position on first render — no initial drift, the sticky behavior catches it from the first pixel of scroll.",
        "There is no standalone breadcrumb row above the two-column grid. The \"← The collection\" breadcrumb renders inside the right column, above the SKU eyebrow.",
        "The rug photograph never exceeds min(75vh, 720px).",
        "The SKU eyebrow renders as \"No. 17600\" with no rug- prefix or other namespace.",
        "Details-block field labels render in oxblood; values render in gray.",
        "The lead paragraph renders in body sans at text-base lg:text-lg, not as a display-serif statement.",
        "An unverified origin, age, or knot-count claim shows a \"preliminary\" tag in the UI.",
        "The page emits Product JSON-LD with the full set of fields.",
        "No AI-drafted text appears in production without an editor's explicit approval (the editor queue is the gate).",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.3",
      eyebrow: "AI surface",
      name: "Concierge (Ask)",
      what: "One door. A single floating concierge pill (FloatingConcierge) sits in the lower-right of the viewport on every route — including the home page — and expands in place into a card the visitor types into. The card is width-capped at min(360px, calc(100vw - 2rem)) so it can never overflow on small viewports. The arrow / send button on the collapsed pill is always active: clicking it with an empty input expands the card in place and focuses the input, so the affordance never reads as dead. The concierge holds short or long conversations, searches the live catalog, answers care and material questions from the curated knowledge base, identifies rugs from photos (with hand-off), classifies service requests, and offers to book a showroom visit or create a lead. The earlier configuration ran four parallel entry points — the floating pill, a hero-overlay HeroAsk pill on the home page, an inline HomeConcierge \"Talk to us\" block on the home page, and a dedicated /discover route with its own conversation surface — and was consolidated to this one because the four-way split fractured the conversation across surfaces and produced confusion about where to type. The retired surfaces: app/discover/page.tsx is deleted, /discover is removed from the sitemap and from the human-exit-required route list, the home page's hero now renders <HeroCarousel /> with no overlay child, the inline \"Talk to the concierge\" CTA on the story page is removed, and the components/HeroAsk.tsx and components/HomeConcierge.tsx files remain on disk but are no longer imported anywhere. The FloatingConcierge component's hideOnRoute switch is now permanently false — the pill is present everywhere.",
      why: "Most visitors leave silently. A conversational front door catches the ones who would have closed the tab and routes them to a real interaction with the showroom. One clearly placed door — the same pill in the same corner on every page — is easier to find and easier to come back to than four competing entry points, and removes the question of which surface owns the conversation when the visitor moves between the home page and a rug page.",
      never: "Quote a price; invent a rug; recommend DIY care on a valuable or silk piece; promise an appraisal value; answer outside the rug domain.",
      acceptance: [
        "Exactly one concierge entry point exists on the site — the floating pill in the lower-right of the viewport — and it is present on every route, including the home page.",
        "/discover returns a 404; it is absent from app/sitemap.ts and from lib/guardrails/human-exit.ts.",
        "The home page hero renders only <HeroCarousel /> with no overlay child element, and the story page has no \"Talk to the concierge\" CTA.",
        "The floating concierge card never overflows the viewport on phones — its width is bounded by min(360px, calc(100vw - 2rem)).",
        "The arrow / send button is interactive at all times; clicking it with empty input expands the card and focuses the input rather than no-oping.",
        "The site header's secondary navigation does not include an \"Ask\" link — only the floating pill exposes the concierge.",
        "The concierge cannot return a price under any prompt. Automated tests prove this on a fixed adversarial set.",
        "The concierge cannot name a rug that the catalog does not actually contain. Automated tests prove this.",
        "Low-confidence or tool-error states return a human hand-off (phone and book-a-visit), never a guess.",
        "Every conversation logs a transcript (consent-gated) that can be reviewed in the lead inbox.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.4",
      eyebrow: "AI surface",
      name: "Rug identification",
      what: "A page where a visitor uploads one or more photos of a rug they own. A vision model returns a preliminary read of origin, age band, and type with confidence, plus what the photos cannot reveal (knot density on the back, dye chemistry, edge finish). The page then offers to book an in-person appraisal.",
      why: "People with old or inherited rugs search \"what is my rug\" constantly. Without this surface they land on hobbyist forums; with it, they land in the showroom's booking flow.",
      never: "Provide a dollar valuation; guarantee authenticity; reach a definitive determination from photos alone.",
      acceptance: [
        "Every result page states the read is preliminary and offers an in-person appraisal.",
        "No dollar amount appears anywhere in the result.",
        "Photos are retained per the stated retention policy and can be deleted on request.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.5",
      eyebrow: "AI surface",
      name: "Service photo triage",
      what: "A page where a visitor uploads photos of damage — stains, moth, fringe wear, water marks — and adds a short note. A vision model returns the observed issue, a severity band (light → specialist-only), and the recommended next step: drop-off, house call, ship-in, or in-showroom inspection. Service intake becomes a lead with photos attached.",
      why: "Service inquiries are converted before a human picks up the phone. The visitor never has to wait, and the showroom receives a triaged ticket rather than a blank inquiry.",
      never: "Recommend DIY methods on antique or silk rugs; quote a service price; promise a turnaround time.",
      acceptance: [
        "Silk, antique, and natural-dye flags always route to specialist handling — automated tests prove this.",
        "The submitted photos and triage band reach the lead inbox along with the visitor's contact info.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.6",
      eyebrow: "Spatial",
      name: "Inline 3D viewer and AR scan-to-room",
      what: "Each rug page renders an inline 3D model built from the rug's photograph and physical dimensions. A small floating toolbar over the viewer gives the visitor explicit controls — zoom in, zoom out, reset to the default view, toggle auto-rotate, and enter fullscreen — rather than relying on discoverable gesture interactions. A QR code beside the viewer opens augmented reality directly on the visitor's phone (Scene Viewer on Android via GLB, Quick Look on iOS via a USDZ companion file). Every rug in the catalog ships with both formats, so AR works on every iPhone and every Android device at v1 — no app to install, no exceptions for selected pieces.",
      why: "Photographs cannot communicate size. AR closes that gap. It is the most direct answer to \"will this fit my room?\" the site can provide. The toolbar acknowledges that many visitors will not discover pinch-to-zoom or drag-to-rotate on their own; explicit buttons get more of them into a usable view. Catalog-wide iOS coverage matters because Quick Look is the AR path most American buyers will take.",
      acceptance: [
        "AR launches without requiring app installation on both major mobile platforms.",
        "The rug's real-world dimensions drive the AR scale — within 5% of physical measurement (verified by an offline script that reads the GLB's POSITION accessor and compares the X/Z extent to the seed's parsed feet/inches dimensions; 49/49 rugs pass within 1% tolerance at v1).",
        "Every catalog rug ships with both a GLB (Android Scene Viewer and the inline viewer) and a USDZ (iOS Quick Look). No rug is iOS-AR blank.",
        "The viewer toolbar exposes zoom, reset, auto-rotate, and fullscreen as labelled buttons, not gestures alone.",
        "If the device cannot support AR, the page degrades to the 3D viewer without errors or empty states.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.7",
      eyebrow: "Spatial",
      name: "Imagined-in-your-room lifestyle row",
      what: "Two AI-rendered surfaces per rug. First, a single \"suggested setting\" image — one well-considered interior rendered from the rug's photograph via Flux 1.1 Pro, sitting directly under the description. Second, a four-scene row below it — the same rug imagined in four different interiors — generated by Flux Kontext Pro, the image-to-image model that preserves pattern, palette, and proportions from the source photograph. The four-scene set is chosen per-rug by aspect ratio: rugs with an aspect ratio below 0.5 (runners) get a runner scene set — foyer, staircase, gallery hallway, kitchen galley — while every other rug gets the standard room set — library, modern living room, under a dining table, and at the foot of a bed. The dispatcher that picks the scene set is shared between the image generator and the seeds patch logic so each rug's stored lifestyle entries carry the correct slugs. Both the lifestyle prompts (Flux Kontext Pro) and the suggested-setting prompt (Flux 1.1 Pro) embed the rug's actual dimensions verbatim — for example, 5'5\" × 8'3\" — with explicit instruction to show the rug at that real-world scale, so the rendered interior is sized to the piece rather than guessed. The row is labelled \"Imagined in your room\" and carries an editorial caption that says, in substance, \"pattern is approximate; the photograph above is definitive.\"",
      why: "The legacy site shows generic stock photos at the bottom of each rug page — the same images regardless of rug. The new site replaces this with rug-aware lifestyle imagery, helping the visitor picture the piece in real interiors without confusing it with the rug's actual photograph. The runner / room dispatch matters because a 2'6\" × 12' runner in a library reads wrong; a runner belongs in a hallway. The real-world size injection matters because a Flux model with no scale hint will frequently render a small rug as room-spanning or a large rug as a doormat — embedding the actual dimensions in the prompt anchors the proportions to truth.",
      never: "Substitute for the rug's product photo; carry a price or a sale; imply that a particular room is included with the rug; be presented as a true photograph of the rug.",
      acceptance: [
        "Caption explicitly notes the renderings are approximate — the photograph above is the definitive image.",
        "Every rug at v1 has the single suggested setting rendered. The four-scene row appears only when at least three of the four scenes have rendered cleanly.",
        "Runners (aspect < 0.5) display the runner scene set; all other rugs display the standard room set. The same dispatcher is used both by the generator and by the seeds patch so the stored slugs match the rendered files.",
        "All 196 lifestyle and 49 suggested-setting images at v1 were generated with the rug's actual dimensions embedded in the prompt.",
        "Pages without enough rendered scenes simply do not display the row — no broken layouts, no placeholder tiles.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.8",
      eyebrow: "Discovery",
      name: "Visual similarity (\"more like this\")",
      what: "At the bottom of every rug detail page, four similar rugs from the catalog — chosen by what the AI sees in the rug's photograph (palette, weave register, era), not by category metadata.",
      why: "Categorical browsing is how today's site works. Visual instinct is how people actually shop for rugs. This unlocks a path through the catalog that doesn't exist on the live site.",
      acceptance: [
        "Similarity is computed offline (image embeddings) and stored — runtime is fast and free.",
        "Similar rugs are always from the available catalog. Sold rugs never appear in this row.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.9",
      eyebrow: "Knowledge",
      name: "Care and FAQ knowledge base",
      what: "A curated knowledge base of care, materials, sizing, services, logistics, and the Isberian quote process. The concierge pulls grounded answers from this base for any care or material question. Each entry has a source the editor controls; the concierge cites the entry it used.",
      why: "The most damaging AI failure in this category is confident advice that ruins a rug. The knowledge base prevents that — and the silk / antique / valuable filter is non-negotiable in code, not in a policy doc.",
      acceptance: [
        "No care or material answer is improvised from model memory — every concierge response in the care domain is traceable to a knowledge-base entry.",
        "Low-confidence retrieval (no matching entry) results in a human hand-off, not a guess.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.10",
      eyebrow: "Conversion",
      name: "Quote request, lead capture, and booking",
      what: "Every rug page surfaces a \"request a quote\" form when the rug is available. Form submissions land in the CRM (HubSpot) and trigger an email to the showroom address. Showroom-aware booking via Cal.com — visitors pick Chicago or Evanston, see real availability, book a slot, receive a calendar invite.",
      why: "Conversion is the only outcome that matters. Every AI surface ultimately offers this path. Consent and retention are stated up front.",
      acceptance: [
        "Lead form submissions always include a consent checkbox before personal data is captured.",
        "Submitted leads include the source rug, transcript (if from concierge), and any uploaded photos.",
        "Bookings auto-create calendar invites for both the visitor and the showroom calendar.",
      ],
    }),
  );

  children.push(
    ...featureBlock({
      index: "5.11",
      eyebrow: "Editorial",
      name: "Editor review queue",
      what: "Primary editorial surface is Sanity Studio, hosted at sanity.io/manage/personal/project/72navbmn. The editor reviews AI-drafted rug descriptions (lead, palette names, design features, distinguishing notes), confirms or corrects each field, and gates publish from there. Origin, age, and knot-count claims remain flagged as preliminary until the editor explicitly verifies them. Edits land in the live dataset and are visible on the site within a 30-second cache window. A secondary, unlisted surface at /curator on the site itself provides a stripped-down editor that also writes through to Sanity — useful for quick changes from a phone or for staff who do not have Studio access — but Sanity Studio remains the canonical workbench.",
      why: "AI-drafted copy is the speed multiplier; editor review is the quality and trust multiplier. The schema only earns its strength when the gate exists in operations, not just in code. Putting the editor in a hosted CMS (rather than a JSON file in the codebase) means non-engineers can edit, history is preserved, and changes do not require a code deploy.",
      acceptance: [
        "No AI-drafted text reaches production without an editor's explicit approval recorded against that field.",
        "Unverified claims display as \"preliminary\" in the UI until the editor toggles the verified flag.",
        "Edits made in Sanity Studio appear on the live site within the cache window with no developer involvement.",
        "The /curator surface is robots-blocked and not linked from anywhere on the public site.",
        "Review actions are logged — who approved which field, when.",
      ],
    }),
  );

  // ── 6. Non-functional requirements ───────────────────────────────────
  children.push(
    rule(),
    eyebrow("Section 6"),
    h1("Non-functional requirements"),
    h3("Performance"),
    body("The site has a defined performance budget that affects search ranking and mobile experience. Both are measured continuously in production."),
  );
  children.push(
    kvTable([
      ["LCP", "Less than 2.5 seconds on a 4G mobile connection (Largest Contentful Paint)."],
      ["CLS", "Less than 0.1 (no visible layout shift while the page settles)."],
      ["INP", "Less than 200 milliseconds (interaction is responsive)."],
      ["Image weight", "Modern formats (AVIF, WebP) with responsive sizes. Hero images priority-loaded; the rest deferred."],
      ["Bundle weight", "JavaScript shipped to the page is bounded; the concierge UI streams in and does not block paint."],
    ]),
  );
  children.push(
    h3("Accessibility"),
    body(
      "WCAG 2.2 AA across every page, including AI surfaces and modals. Keyboard navigable. Visible focus states. Skip-to-content link. Alt text on every image, descriptive not decorative. Animations respect reduced-motion preferences. Forms have explicit labels, not just placeholders.",
    ),
    h3("Search engine and AI assistant optimization (SEO + AEO)"),
    body(
      "Every rug, service page, and FAQ entry emits the correct structured data (JSON-LD): Product for rugs, Service for service pages, FAQPage for the knowledge base, LocalBusiness for the showrooms, BreadcrumbList for navigation. A sitemap is generated and updated on every catalog change. Per-rug social-share images are rendered server-side with the rug at the center.",
    ),
    h3("Privacy and consent"),
    body(
      "Personal data is captured only with explicit consent on a per-form basis. Transcripts and uploaded photos have a stated retention window (default 30 days) after which they are purged. A privacy policy is linked from the footer and from every form. Cookie use is minimal and described.",
    ),
    h3("Reliability and failure modes"),
    body(
      "Every AI surface degrades to a human exit on failure — never to a guess. If a tool is unavailable, the concierge surfaces the showroom phone numbers and offers to book a visit. If an image fails to load, the page does not break. If the catalog backend is unreachable, the site continues to serve cached versions of every rug page.",
    ),
  );

  // ── 7. Technical architecture (overview) ─────────────────────────────
  children.push(
    rule(),
    eyebrow("Section 7"),
    h1("Technical architecture (overview)"),
    body("This section is intentionally non-prescriptive. It names the moving parts so non-engineering stakeholders can understand how the system fits together."),
  );
  children.push(
    kvTable([
      ["Framework", "Next.js (React + TypeScript) server-rendered into static HTML with selective interactivity."],
      ["Hosting", "Vercel — edge cached, automatic SSL, instant rollbacks."],
      ["Design tokens", "Tailwind theme with three named brand colors: ink (#1F1F1E), stone (warm off-white), and oxblood (#570F12). The oxblood value was sampled via getComputedStyle on the live legacy isberian.com site — it is the link and label color the brand has used for decades. Every text-oxblood and bg-oxblood usage in the codebase picks up that heritage burgundy automatically, including the rug-detail Details field labels and the editorial eyebrow text."],
      ["Catalog data store", "Sanity (hosted CMS, project ID 72navbmn) holds the canonical catalog. The site reads via GROQ at request time through a SanityCatalogSource adapter behind a 30-second in-memory cache. The CATALOG_SOURCE environment variable selects between sanity (production) and a fixture file (local development). The SanityCatalogSource backfills sizeMetric from sizeImperial at request time — the Sanity migration did not carry the metric form, so a one-liner regex plus ft/in → meters arithmetic in the adapter ensures the Size line in the Details block always renders complete (\"5'6\" × 7'9\" (1.68 × 2.36 m)\") rather than with empty parentheses. Vector embeddings for visual similarity and semantic search live alongside in Postgres + pgvector."],
      ["Upstream inventory feed", "Authoritative inventory metadata — sizes, origin, materials, status — is sourced from the legacy isberian.com API. The www host is fronted by Cloudflare WAF and unreliable for programmatic access; the public, unauthenticated service.isberian.com/api endpoint is what the ingest pipeline reads. The pipeline scrapes metadata from the upstream and uses Claude vision to draft prose (lead, palette names, design features) for editor review."],
      ["Content (editorial)", "The same Sanity project holds journal entries, knowledge-base articles, and editor-approved rug descriptions — one CMS, one editor login."],
      ["AI", "Anthropic Claude (sonnet-class) via the official SDK for orchestration, vision, and care answers. Image generation: Flux 1.1 Pro for the single suggested-setting render per rug; Flux Kontext Pro for the four-scene lifestyle row, both via Replicate. The lifestyle generator picks a scene set per rug by aspect ratio — runners (aspect ratio below 0.5) get RUNNER_SCENES (foyer, staircase, gallery hallway, kitchen galley); everything else gets ROOM_SCENES (library, modern living, dining, bedroom). The same dispatch function is reused by the seeds.json patch step so each rug's lifestyle slug array matches the file set on disk. Both the lifestyle and suggested-setting prompts embed the rug's actual dimensions verbatim, with explicit \"show it at that real-world scale\" guidance, so the rendered interior is sized to the piece rather than guessed."],
      ["3D and AR pipeline", "Each rug ships a GLB (used by the inline model-viewer and by Android Scene Viewer) and a USDZ companion (used by iOS Quick Look). The USDZ is produced by an in-house Python script using pxr and pygltflib. A verification script reads every GLB's POSITION accessor with @gltf-transform/core and checks that the X/Z extent matches the seed's physical dimensions within 1% tolerance."],
      ["Booking", "Cal.com adapter for showroom-aware scheduling."],
      ["Lead capture", "HubSpot webhook plus email-to-showroom fallback."],
      ["Image pipeline", "All images flow through a responsive, modern-format pipeline (Cloudinary or Imgix). EXIF stripped on import."],
      ["Analytics", "Privacy-respecting analytics with conversion attribution. No third-party tracking pixels."],
    ]),
  );

  // ── 8. Operations and governance ─────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Section 8"),
    h1("Operations and governance"),
    h3("Content workflow"),
    body(
      "AI drafts a rug description from the photographs and inventory metadata. The editor opens Sanity Studio (sanity.io/manage/personal/project/72navbmn), reviews each field — lead, palette names, design features, distinguishing notes — and either approves, edits, or rejects. Verified facts (age, origin, knot count) require an explicit verified-flag toggle. Approved fields publish; rejected fields stay in draft. Edits land on the live site within the 30-second cache window — no engineering involvement, no code deploy. The full action log is retained inside Sanity's history. A secondary editor surface at /curator on the site itself writes through to the same Sanity dataset and is available for staff who do not have Studio access or for quick edits from a phone.",
    ),
    h3("Catalog ingestion"),
    body(
      "Upstream inventory data lives at the legacy isberian.com API. The www host is fronted by Cloudflare and unreliable for scripted reads; ingest pulls from the public service.isberian.com/api endpoint instead. Sizes, origin, materials, and status are read as authoritative from upstream. Claude vision drafts the prose fields (lead, palette, design features) from the rug's photographs. The combined record lands in Sanity as a draft for editorial review. New rugs land as drafts; sold rugs are flagged within minutes; price fields, if present in the upstream feed, are dropped at the ingestion boundary and never written to the Sanity dataset.",
    ),
    h3("Catalog growth"),
    body(
      "At v1 launch the catalog holds 49 rugs — every one of them passes the 3D-readiness bar (verifiable physical dimensions, clean overhead photography, no shapes that defeat the model). The catalog grew from an initial seed of 30 in two motions: three pieces were dropped because they could not produce a clean 3D model (17600, 23000, 63750), and 22 new pieces were ingested from the upstream feed. Future catalog growth follows the same pipeline — ingest upstream metadata, draft prose with AI, gate publish through the editor in Sanity.",
    ),
    h3("Metrics worth watching"),
    bullet("Bookings created from rug pages, segmented by source surface (concierge, gallery, identify, triage)."),
    bullet("Concierge conversations completed (versus abandoned)."),
    bullet("Cite-rate in AI assistants — periodic audits via brand monitoring tools."),
    bullet("Catalog crawl freshness — time between a rug being marked sold upstream and the new site reflecting it."),
    bullet("Performance and accessibility scores — Core Web Vitals trend, Lighthouse score."),
    h3("Cost model"),
    body(
      "Operating costs fall into three buckets: hosting (Vercel + database) is the floor; AI inference (Anthropic for orchestration and vision, Replicate for imagery) scales with traffic; integrations (HubSpot, Cal.com, image CDN) are stable subscriptions. All AI usage is logged per surface, so cost can be attributed cleanly to features rather than estimated.",
    ),
  );

  // ── 9. Out of scope (Phase 2 / 3) ────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Section 9"),
    h1("Out of scope for Phase 1"),
    body("The features below are explicitly out of scope for the current launch. They are listed so the boundary is unambiguous, not because they are unimportant."),
    bullet("Room visualizer that places the rug into the visitor's own uploaded room photograph (the lifestyle row in Section 5.7 ships rug-aware imagined interiors at v1 — every rug has a suggested-setting render and most have the four-scene row — but the visitor's own room is still Phase 2)."),
    bullet("Trade portal and trade copilot — designated dealer surfaces with pricing visibility, memo workflow, and project tools. Phase 3."),
    bullet("Wishlist and consumer accounts beyond an email-based wishlist."),
    bullet("Payments, checkout, or any direct online purchase flow."),
    bullet("Multi-language support."),
    bullet("Native mobile app — AR uses platform-native viewers (Scene Viewer on Android, Quick Look on iOS) and works across the full catalog without an app at v1; a wrapper app remains out of scope."),
  );

  // ── 10. Acceptance criteria (whole-site gates) ───────────────────────
  children.push(
    rule(),
    eyebrow("Section 10"),
    h1("Acceptance criteria"),
    body("These gates run before every deployment. A failure in any one of them blocks the deployment, regardless of whether the failure is cosmetic, behavioral, or editorial."),
    h3("Editorial gates"),
    bullet("Price guardrail — no AI surface emits a dollar amount under any input. Adversarial test set covers \"how much,\" \"what's it worth,\" \"do you sell it,\" and unusual phrasings."),
    bullet("Inventory guardrail — the concierge cannot name a rug that the catalog does not contain. Random fabrication attempts are blocked."),
    bullet("Valuation guardrail — identification surfaces never return a dollar value. Always preliminary, always with a human hand-off offered."),
    bullet("Care safety — silk, antique, or natural-dye flags always route to professional service, never DIY."),
    h3("Engineering gates"),
    bullet("Crawlability — every catalog and rug URL returns the primary content and valid JSON-LD in the initial HTML, with JavaScript disabled."),
    bullet("Core Web Vitals — LCP, CLS, INP within budget on the routes affected by the change."),
    bullet("Accessibility — automated checks (axe-core or pa11y) report zero serious or critical issues."),
    bullet("Structured data — Google's Rich Results Test passes on every rug page and the FAQ."),
    bullet("3D dimension verification — every GLB's X/Z extent matches the seed's physical dimensions within 1% tolerance, and every rug has a USDZ companion present for iOS Quick Look."),
    h3("Operational gates"),
    bullet("Human exit visible on every AI surface (phone numbers and book-a-visit)."),
    bullet("Lead capture verified end-to-end — a submitted form arrives in HubSpot and in the showroom email inbox."),
    bullet("Photography rights — any reused partner / designer image is confirmed under reuse rights before publish."),
    rule(),
  );

  // ── 11. Glossary ─────────────────────────────────────────────────────
  children.push(
    eyebrow("Section 11"),
    h1("Glossary"),
  );
  children.push(
    kvTable([
      ["AEO", "Answer Engine Optimization — making content readable to AI assistants (ChatGPT, Perplexity, Google AI overviews) so the site is cited inside their answers."],
      ["AR", "Augmented Reality — placing a 3D model into the visitor's real environment via their phone's camera."],
      ["CMS", "Content Management System — the editorial back-office where journal entries, knowledge-base articles, and rug descriptions are reviewed and published."],
      ["CRM", "Customer Relationship Management — the system (HubSpot) where leads and conversations are tracked."],
      ["CWV", "Core Web Vitals — Google's mobile performance metrics: LCP, CLS, INP."],
      ["Hand-off", "Routing a conversation or request from an AI surface back to a human (a phone number, a booking, or a lead in the CRM)."],
      ["JSON-LD", "Structured data format embedded in pages so search engines and AI assistants can parse facts reliably."],
      ["LCP, CLS, INP", "Three Core Web Vitals — Largest Contentful Paint, Cumulative Layout Shift, Interaction to Next Paint."],
      ["Lifestyle row", "Row of AI-rendered scenes showing the same rug in different imagined interiors (Section 5.7)."],
      ["GLB", "A single-file 3D model format used by the inline viewer and by Android's Scene Viewer for AR."],
      ["USDZ", "Apple's 3D model format. Required for iOS Quick Look AR — every rug ships a USDZ alongside its GLB."],
      ["RugDescription", "The structured set of fields rendered on every rug detail page (Section 5.2)."],
      ["Sanity", "The hosted headless CMS used for catalog records, journal entries, and the knowledge base. Project ID 72navbmn."],
      ["SKU", "The rug's stable inventory number (e.g., 17600). Surfaced as an eyebrow above the title across every rug surface."],
      ["WCAG 2.2 AA", "Accessibility standard — the published requirements every page on the site is built to meet."],
    ]),
  );

  // Closer
  children.push(
    rule(),
    eyebrow("Sign-off"),
    h1("Sign-off"),
    body(
      "This specification reflects the agreed Phase 1 scope and the rules under which it is built. Changes to scope, voice, or guardrails require written acknowledgement before implementation begins.",
    ),
    new Paragraph({
      spacing: { before: 360, after: 80 },
      children: [
        new TextRun({ text: "Owner   ", font: "Calibri", size: 22, bold: true, color: INK }),
        new TextRun({ text: "______________________________", font: "Calibri", size: 22, color: SOFT }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({ text: "Date    ", font: "Calibri", size: 22, bold: true, color: INK }),
        new TextRun({ text: "______________________________", font: "Calibri", size: 22, color: SOFT }),
      ],
    }),
  );

  return new Document({
    creator: "Oscar Isberian Rugs",
    title: "Oscar Isberian Rugs — New site specification",
    description: "Plain-language specification of the new Isberian site.",
    numbering: {
      config: [
        {
          reference: "spec-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "—",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } },
              },
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: "·",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: convertInchesToTwip(0.7), hanging: convertInchesToTwip(0.25) } },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: convertInchesToTwip(8.5),
              height: convertInchesToTwip(11),
            },
            margin: {
              top: convertInchesToTwip(0.9),
              right: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(0.9),
              left: convertInchesToTwip(1.0),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Oscar Isberian Rugs · New site specification · v1.0",
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                    characterSpacing: 40,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Page ", font: "Calibri", size: 16, color: MUTED }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: MUTED }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

async function main() {
  const doc = buildDoc();
  const buf = await Packer.toBuffer(doc);
  const out = path.resolve(process.cwd(), "isberian-new-site-specification.docx");
  await writeFile(out, buf);
  console.log(`Wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
