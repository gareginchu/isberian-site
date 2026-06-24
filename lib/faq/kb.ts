import type { FaqEntry, CareGuide } from "@/lib/types/faq";

/**
 * Curated FAQ + care knowledge base. Until Sanity is wired, these fixtures are the source of truth.
 * Every entry is editor-verified; care advice involving silk/antique pieces routes professional-only.
 */

export const faqEntries: FaqEntry[] = [
  {
    id: "faq-prices",
    slug: "why-no-prices",
    category: "quote-process",
    question: "Why aren't prices listed?",
    answer:
      "Rugs at this caliber vary by condition, knot count, dye source, and provenance — and the right piece depends on your room. We share a clear quote in person or by email once we understand the brief. Save a piece to your wishlist and we'll follow up.",
    routesToHuman: true,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-vacuum",
    slug: "vacuuming-wool-rugs",
    category: "care",
    question: "How should I vacuum a hand-knotted wool rug?",
    answer:
      "Use suction only — turn off the beater bar. Vacuum in the direction of the pile, not across it. Avoid the fringes; vacuum past them onto the wood floor. Once or twice a week is plenty in a normal household.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-spill",
    slug: "spill-first-aid",
    category: "care",
    question: "I just spilled red wine on my rug — what now?",
    answer:
      "Blot — don't rub — from the outside of the spill in, with a clean white cloth. Cool water only, no soap, no vinegar, no salt. Call us as soon as you can so we can advise on next steps based on the rug. For antique, silk, or natural-dye pieces, please don't apply household solutions; they can set the stain or shift the dye.",
    routing: "professional-only",
    routesToHuman: true,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-silk-clean",
    slug: "silk-rug-cleaning",
    category: "care",
    question: "Can I clean a silk rug at home?",
    answer:
      "No. Silk is far more sensitive to water, heat, and pH than wool — household methods can cause permanent damage to the pile and the dyes. Silk rugs are handled in our cleaning studio with low-moisture methods and color-stable rinses. We can collect locally or arrange shipping.",
    routing: "professional-only",
    routesToHuman: true,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-pad",
    slug: "do-i-need-a-pad",
    category: "care",
    question: "Do I need a rug pad?",
    answer:
      "On wood and stone floors, yes — a quality pad prevents slipping, cushions the foundation, and extends the life of the rug. We recommend a felt-and-rubber pad cut to roughly an inch shorter than the rug on each side. We stock pads in the showroom and can cut to size.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-size",
    slug: "what-size-for-living-room",
    category: "sizing",
    question: "What size rug should I get for my living room?",
    answer:
      "The most forgiving rule: the front legs of the sofa and chairs sit on the rug, with at least 8–12 inches of rug showing around the seating group. If you want a fully grounded look, plan for the back legs on as well. Bring dimensions, a couple of photos, and a sense of the architecture — we'll walk through options.",
    routesToHuman: false,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-trial",
    slug: "can-i-take-rugs-home-to-try",
    category: "services",
    question: "Can I take rugs home to try?",
    answer:
      "Yes. We send rugs out on memo (approval) — for design clients and for retail clients we know — so you can see them in your light. There's no obligation. The team handles delivery and pickup.",
    routesToHuman: true,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-services",
    slug: "do-you-clean-and-repair",
    category: "services",
    question: "Do you clean and repair rugs?",
    answer:
      "We do — hand cleaning in our studio, full restoration, fringe and selvage work, moth treatment, and reweaving. We handle pieces we sold and pieces we didn't. The first step is a free in-showroom inspection or a service triage online.",
    routesToHuman: true,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-trade",
    slug: "do-you-work-with-designers",
    category: "trade",
    question: "Do you work with interior designers?",
    answer:
      "Yes — trade is a meaningful part of the practice. We offer designer pricing, memo on approved accounts, project-specific holds, and access to pieces before they're listed. The trade page starts the introduction.",
    routesToHuman: true,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-hours",
    slug: "showroom-hours-locations",
    category: "showroom",
    question: "Where are your showrooms and when can I visit?",
    answer:
      "Chicago: 122 W Kinzie Street, by appointment Monday–Saturday. Evanston: 1030 Chicago Avenue, Tuesday–Saturday. Both showrooms are walk-through; we recommend booking a window so a team member can give you proper attention.",
    routesToHuman: true,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "faq-id",
    slug: "rug-identification",
    category: "services",
    question: "Can you tell me what my rug is?",
    answer:
      "Often, yes — origin, age band, type. Photos can get us most of the way; in person we can also check the foundation, the knot, the dyes, and the back. Identification is preliminary on photos; we don't issue valuations or authentications, but we can recommend an appraiser when one is needed.",
    routesToHuman: true,
    verified: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
];

export const careGuides: CareGuide[] = [
  {
    id: "care-everyday",
    slug: "everyday-care",
    title: "Everyday care",
    excerpt: "A few small habits make a hand-knotted rug last several generations.",
    body:
      "## Rotate\nRotate the rug 180° once or twice a year. Light, traffic, and furniture all wear the pile unevenly; rotating distributes that wear and is the single most useful habit.\n\n## Vacuum gently\nSuction only — turn off the beater bar. Vacuum in the direction of the pile.\n\n## Address spills fast\nBlot, never rub. Cool water only. Call us before applying any household solution to an antique, silk, or natural-dye piece.",
    routing: "diy-ok",
    related: ["faq-vacuum", "faq-spill"],
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "care-antique-and-silk",
    slug: "antique-and-silk",
    title: "Antique and silk pieces",
    excerpt:
      "Antique, silk, and natural-dye rugs are handled differently from everyday wool. Household methods can cause permanent damage.",
    body:
      "## The short version\nFor antique, silk, or natural-dye pieces: no household cleaning solutions, no steam, no machine wash, no spray-on products. Blot spills with cool water and call us.\n\n## Why\nSilk pile reacts to water and pH in ways wool does not. Natural dyes can run or shift permanently under common household acids and alkalis.\n\n## What we recommend\nBring the piece in for inspection. We use low-moisture methods and color-stable rinses appropriate to the piece.",
    routing: "professional-only",
    related: ["faq-silk-clean", "faq-spill"],
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
];
