/**
 * Builds a plain-language report for Oscar Isberian — what the new site does
 * that the current isberian.com doesn't. Avoids jargon, keeps the focus on
 * what the visitor experiences and why it matters to the showroom.
 *
 *   pnpm tsx scripts/build-report.ts
 *
 * Output: isberian-new-features-report.docx (in repo root)
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
} from "docx";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const INK = "1F1F1E";
const MUTED = "6E6E6C";
const ACCENT = "570F12";

function eyebrow(text: string) {
  return new Paragraph({
    spacing: { before: 320, after: 80 },
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

function h1(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({ text, font: "Georgia", size: 56, color: INK }),
    ],
  });
}

function h2(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 120 },
    keepNext: true,
    children: [
      new TextRun({ text, font: "Georgia", size: 32, color: INK }),
    ],
  });
}

function lead(text: string) {
  return new Paragraph({
    spacing: { before: 80, after: 200, line: 320 },
    children: [
      new TextRun({ text, font: "Georgia", size: 26, color: INK, italics: true }),
    ],
  });
}

function body(text: string) {
  return new Paragraph({
    spacing: { before: 0, after: 160, line: 300 },
    children: [
      new TextRun({ text, font: "Calibri", size: 22, color: INK }),
    ],
  });
}

function labeled(label: string, text: string) {
  return new Paragraph({
    spacing: { before: 0, after: 140, line: 300 },
    children: [
      new TextRun({ text: `${label}  `, font: "Calibri", size: 22, bold: true, color: INK }),
      new TextRun({ text, font: "Calibri", size: 22, color: "3A3A38" }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    spacing: { before: 0, after: 80, line: 280 },
    numbering: { reference: "feature-bullets", level: 0 },
    children: [
      new TextRun({ text, font: "Calibri", size: 22, color: "3A3A38" }),
    ],
  });
}

function rule() {
  return new Paragraph({
    spacing: { before: 320, after: 320 },
    border: { bottom: { color: "C9C9C5", space: 4, style: BorderStyle.SINGLE, size: 4 } },
    children: [],
  });
}

function buildDoc() {
  const sections = [];

  const children: Paragraph[] = [];

  // ── Cover block ──────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      spacing: { before: 1200, after: 80 },
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
      children: [
        new TextRun({ text: "What the new site does that the", font: "Georgia", size: 56, color: INK }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 480 },
      children: [
        new TextRun({ text: "current site doesn't.", font: "Georgia", size: 56, color: INK, italics: true }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: "A plain-language tour of the additions in the new site — written for the showroom, not engineers. June 2026.",
          font: "Calibri",
          size: 24,
          color: MUTED,
          italics: true,
        }),
      ],
    }),
    rule(),
  );

  // ── Opening ──────────────────────────────────────────────────────────
  children.push(
    eyebrow("In short"),
    h1("Same century. Same craft. A new front door."),
    body(
      "We rebuilt the site keeping every part of the Isberian story intact — the heritage, the voice, the two showrooms in Chicago and Evanston, and the quoted-only business model. Nothing about how you sell rugs has changed. The navbar on every interior page carries the same pale-gray register as the current isberian.com, with the dark logo and burgundy on hover, so a returning customer recognizes the house at a glance; on the home page the navbar sits over the rug carousel in cream, because there the imagery is the anchor. What's different is what happens before the visitor calls the showroom: instead of a static catalog and a contact form, the front door is now a conversation, a camera, and a catalog that machines can read."
    ),
    body(
      "The site is currently showing forty-nine rugs, ingested directly from the live Isberian inventory feed — sizes, origins, and materials come from the same source the showroom already maintains. Every one of those rugs has a 3D model, an augmented-reality companion for iPhone and Android, a structured description, and a room visualization. The catalog itself now lives in a hosted editorial system — when the showroom edits a rug, the change appears on the public site within about thirty seconds. No engineer required."
    ),
    body(
      "Every feature below was designed with one rule in mind: it must make a visitor more likely to call, book a visit, or send a real question to the showroom — never less. Each one routes back to a person."
    ),
  );

  // ── Feature 1: Concierge ─────────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 01"),
    h2("Ask anything — the concierge."),
    lead("A single quiet pill in the bottom-right corner of every page: Ask anything. Click it, type a question, get a real answer in your voice."),
    body(
      "On every page of the site — including the home page — a quiet pill sits in the bottom-right corner: Ask anything. There is one concierge, in one place, and the visitor never has to hunt for it. A visitor types something like \"I'm looking for something for a dining room with a blue ceiling,\" or \"I have an old Persian rug — can it be cleaned?\", or \"When can I come in?\". The concierge answers in the Isberian voice, links to real rugs in the collection, and offers to book a visit or send the question straight to the showroom."
    ),
    labeled("Why it matters.", "Most visitors leave silently. A single, always-present concierge — in the same place on every page, including the home page — catches the ones who would have closed the tab and routes them to a real conversation with you."),
    labeled("What it will never do.", "Quote a price. Invent a rug. Recommend bleach on a silk runner. Each of those is enforced by automated tests that block the site from going live if they're violated."),
  );

  // ── Feature 2: Identify ──────────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 02"),
    h2("Identify a rug."),
    lead("A visitor uploads photos of a rug they own. The site responds with a preliminary read and a booking offer."),
    body(
      "Photos go in. The site returns its best read on origin, age band, and type — with confidence levels — plus what it can't tell from the photos alone (knot density on the back, edge finish, dye chemistry). It then offers an appraisal at the showroom."
    ),
    labeled("Why it matters.", "People with old or inherited rugs Google \"what is my rug\" constantly. Today they land on Reddit. With this they land in your booking flow."),
    labeled("What it will never do.", "Give a valuation. Guarantee authenticity. Anything definitive happens in person — that's stated on the page."),
  );

  // ── Feature 3: Service Triage ────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 03"),
    h2("Service triage."),
    lead("A photo of damage in. A diagnosis and a next step out."),
    body(
      "A visitor uploads photos of a stain, moth damage, fringe wear, or water marks — adds a short note. The site returns what it sees, a severity band (from light to specialist-only), and the recommended next step: drop-off, house call, ship-in, or an in-showroom inspection."
    ),
    labeled("Why it matters.", "It turns \"I have a problem\" into a booked service inquiry — without making the visitor wait for someone to call back."),
    labeled("What it will never do.", "Recommend DIY cleaning on an antique or silk piece. Those route to the specialist, every time."),
  );

  // ── Feature 4: 3D + AR ───────────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 04"),
    h2("See the rug in your room."),
    lead("Every rug becomes a 3D object on its page. A QR code next to it places the rug on the visitor's floor through their phone camera — at true scale, no app to install."),
    body(
      "On a rug's page the visitor can rotate the rug in 3D. A small toolbar floats over the viewer — zoom in, zoom out, reset, auto-rotate, fullscreen — so the controls are visible, not hidden behind a guessed gesture. Beside the viewer sits a small QR code. The visitor scans it with the phone camera and the rug opens in augmented reality on their floor, sized to scale. This now works for every rug in the catalog on both iPhone (through Quick Look) and Android (through Scene Viewer). No download, no account."
    ),
    body(
      "Below the description we also show two AI-rendered room scenes for each rug: a single \"imagined in your room\" photograph, and a four-image strip. The scene set is chosen by the rug's shape — a standard rug is imagined in a library, a modern living room, a dining room, and a bedroom; a runner is imagined down a long foyer, up a staircase, along a gallery hallway, and through a galley kitchen. Each scene is also rendered against the rug's real-world size, so a small accent doesn't get scaled up to fill a sectional and a large carpet doesn't get shrunk to look incidental. The copy beneath the strip is explicit that these are imagined settings and the pattern is approximate. They are mood, not specification; the AR view is the specification."
    ),
    labeled("Why it matters.", "The single thing a photo cannot communicate about a rug is size — the visitor can't tell whether a 9×12 covers their dining room. Augmented reality closes that gap. The room scenes answer the softer question — \"what does this rug feel like in a real interior?\" — that a flat product photograph cannot."),
    labeled("True to scale.", "An automated check measures every rug's 3D model against the size recorded in the catalog. Forty-nine out of forty-nine currently pass within one percent. If a model ever drifts out of scale, the site refuses to ship until it is fixed."),
    labeled("Where the QR code can live.", "On the website, but also printed on a card next to the rug in the showroom — so a visitor walking the floor can scan and see the rug in their kitchen at home, before they leave."),
  );

  // ── Feature 5: More like this ────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 05"),
    h2("More like this — by eye, not by tag."),
    lead("At the bottom of each rug's page, four similar rugs — chosen by what the site sees in the photo, not by category."),
    body(
      "A visitor admiring a 1920 Kazak gets four more rugs that look adjacent in palette and weave — even if they're from different regions or eras. The match is made by an image model that compares the visual feel, not the metadata."
    ),
    labeled("Why it matters.", "Today's catalog browses by category. People shop for rugs by visual instinct. This unlocks a path through the collection they didn't have."),
  );

  // ── Feature 6: Structured Descriptions ───────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 06"),
    h2("Every rug, described the same way — and edited live."),
    lead("A typed structure: a one-line lead, the technical details, the palette as actual color chips, design features, distinguishing notes, and provenance. Edited from a browser, not a codebase."),
    body(
      "Today's site has free prose on each rug — sometimes a paragraph, sometimes a sentence. The new site uses the same set of fields on every rug, so each rug is answerable in a consistent way: by visitors scanning the page, by search engines, and by AI assistants (ChatGPT, Google's AI overviews) that increasingly answer questions directly. The AI drafts each field from the photos and the inventory data; an editor at the showroom verifies anything about origin, age, or knot count before it goes live. Anything unverified stays visibly flagged."
    ),
    body(
      "Each rug also carries its inventory number — No. 17600, No. 51500 — as a small eyebrow above the title on the card and on its own page. Matches the convention on the current site and lets a customer reference a rug by number when they call the showroom."
    ),
    body(
      "The collection page itself reads the way the current isberian.com clearance page reads. A search box at the top of the sidebar, then collapsible filter groups — by style, by color, by size, by origin — that open and close with a plus or minus. The filters a visitor has chosen are summarized at the top of the grid as small chips they can clear one at a time, or all at once. The grid carries a count of pieces found, a sort menu (newest, title, size small to large or large to small), and page-by-page navigation. A returning customer's muscle memory still works."
    ),
    labeled("Edited from the browser.", "The catalog now lives in a hosted editorial system. The curator opens the rug, edits the title or the lead or the color palette, hits publish, and the public site reflects the change within about thirty seconds. No code, no engineer. If the curator prefers a simpler view, there is a private editing surface on the site itself at /curator that writes through to the same catalog — same edits, leaner interface, unlisted from search engines."),
    labeled("Reading order on every rug page.", "Title and inventory number first, then the description, then the 3D viewer and the AR code, then the request-a-quote form, then the human exit — phone and book-a-visit. The text answers the visitor before the toys do."),
    labeled("Why it matters.", "Structured data is what makes Isberian appear inside the answers people get from search engines and AI assistants. Without it, the rugs are invisible to that traffic. With it, your editorial bar — never claim what you can't verify — is enforced by the structure itself, not by hope. And because the showroom can now edit any rug at any time without an engineer, the catalog is a living document instead of a quarterly project."),
  );

  // ── Feature 7: Care Knowledge Base ───────────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 07"),
    h2("A care knowledge base behind every answer."),
    lead("The concierge does not improvise on care, materials, or cleaning. It pulls from a curated knowledge base and cites the entry."),
    body(
      "Every care or material question — \"can I steam clean a silk runner?\", \"is wool safe under a dining table?\", \"what does foundation mean?\" — is answered from a knowledge base the showroom controls. For anything valuable, antique, or silk, the answer always routes to professional service rather than household DIY."
    ),
    labeled("Why it matters.", "The most damaging AI failure mode in this category is confident advice that ruins a rug. The knowledge base prevents that — and the silk / antique / valuable filter is non-negotiable in code."),
  );

  // ── Feature 8: Five Rules ────────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 08"),
    h2("Five rules, codified."),
    lead("These match how Isberian has always worked. What's new is that they are tests — not policy documents."),
    bullet("No prices, ever. Quotes only."),
    bullet("No fabricated inventory. Only real rugs from the collection."),
    bullet("No valuations or authenticity guarantees online. That happens in person."),
    bullet("No risky DIY on antique or silk rugs. Always route to the specialist."),
    bullet("Always a visible human exit — phone, address, book-a-visit."),
    body(
      "A change to the codebase that would let the concierge slip a price into an answer, or fabricate a rug that isn't real, automatically blocks the site from deploying. The rules are not a discipline anyone has to remember — they are enforced by the machine."
    ),
  );

  // ── Feature 9: Performance & SEO ─────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Feature 09"),
    h2("Built to be found and to be fast."),
    lead("Search engines, AI assistants, and slow phones."),
    body(
      "The site is engineered to meet Google's Core Web Vitals targets (fast load on mobile, no layout shift while reading, instant interaction) and WCAG 2.2 AA accessibility (readable with a screen reader, keyboard-navigable, respects reduced-motion preferences). Each rug, service page, and FAQ entry also emits structured data — Product, Service, FAQPage, LocalBusiness — so that when somebody asks ChatGPT \"who restores Persian rugs in Chicago\" or Google \"vintage Kazak rug,\" Isberian is candidate material for the answer."
    ),
    labeled("Why it matters.", "Both performance and accessibility affect search ranking. Structured data affects whether Isberian is named inside AI-generated answers. None of this is visible to the visitor — but all of it shapes how often the visitor arrives in the first place."),
  );

  // ── Closer ───────────────────────────────────────────────────────────
  children.push(
    rule(),
    eyebrow("Closer"),
    h1("The showroom is still the answer."),
    body(
      "None of this changes what Isberian does. The voice is unchanged. The business model — quoted only, showroom-first, trade-aware — is unchanged. The rugs are real. The two phone numbers still ring at the showrooms. What changes is the front door. Instead of a static catalog and a contact form, the front door is now a conversation, a camera, and a structured catalog that machines can read."
    ),
    body(
      "The visitor still ends up where they should: in front of you, with a rug, with their question, in person."
    ),
  );

  sections.push({
    properties: {
      page: {
        size: {
          orientation: PageOrientation.PORTRAIT,
          width: convertInchesToTwip(8.5),
          height: convertInchesToTwip(11),
        },
        margin: {
          top: convertInchesToTwip(0.9),
          right: convertInchesToTwip(1.1),
          bottom: convertInchesToTwip(0.9),
          left: convertInchesToTwip(1.1),
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
                text: "Oscar Isberian Rugs · New-site features",
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
              new TextRun({
                text: "Page ",
                font: "Calibri",
                size: 16,
                color: MUTED,
              }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: MUTED }),
            ],
          }),
        ],
      }),
    },
    children,
  });

  return new Document({
    creator: "Oscar Isberian Rugs",
    title: "What the new site does that the current site doesn't",
    description: "Plain-language report on the AI-native additions in the new Isberian site.",
    numbering: {
      config: [
        {
          reference: "feature-bullets",
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
          ],
        },
      ],
    },
    sections,
  });
}

async function main() {
  const doc = buildDoc();
  const buf = await Packer.toBuffer(doc);
  const out = path.resolve(process.cwd(), "isberian-new-features-report.docx");
  await writeFile(out, buf);
  console.log(`Wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
