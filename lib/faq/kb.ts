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
  {
    id: "faq-antique-spill",
    slug: "small-spill-antique-rug",
    category: "care",
    question: "How do I clean a small spill on my antique rug?",
    answer:
      "Blot, don't rub — work from the outside of the spill in, with a clean white cloth. Use cool water on the cloth, not poured onto the pile. No household cleaners, no soap, no vinegar, no salt; on antique, silk, or natural-dye pieces these can set the stain or shift the dye permanently. Once the spot is blotted as dry as you can get it, call us. If the piece has any value to you, we'd rather inspect it than have you keep working at it.",
    routing: "professional-only",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-06-27T00:00:00.000Z",
  },
  {
    id: "faq-rotate",
    slug: "how-often-rotate-rug",
    category: "care",
    question: "How often should I rotate my rug?",
    answer:
      "Every six to twelve months — turn the rug 180° between rotations. There are two reasons to do it: sun fade is uneven across the room, and traffic wears the pile in patterns set by how you walk and where the furniture sits. Rotating spreads both out. It is the single most useful habit for keeping a rug even over decades.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-06-27T00:00:00.000Z",
  },
  {
    id: "faq-shedding",
    slug: "new-wool-rug-shedding",
    category: "care",
    question: "Why does my new wool rug shed?",
    answer:
      "Shedding is normal for the first six to twelve months on a hand-knotted wool rug. Loose fibers left from spinning and weaving work their way out as the pile compacts under use. Vacuum gently — suction only, no beater bar — and the shedding settles. If you're still seeing significant fiber after a year, call us; we'll take a look.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-06-27T00:00:00.000Z",
  },
  {
    id: "faq-kpsi",
    slug: "what-is-kpsi",
    category: "materials",
    question: "What does 'KPSI' mean and does it matter?",
    answer:
      "KPSI is knots per square inch — a measure of weave density. Higher KPSI means a finer grid, denser pile, and generally more time at the loom. It matters most as a within-tradition signal. A 200-KPSI Tabriz and an 80-KPSI Kazak are not a quality comparison — they're different traditions, with different intentions, different wools, and different drawings. A Kazak is supposed to be bold and tactile; a fine Tabriz is supposed to read like a painting. Come into the showroom and we'll show you both, side by side; KPSI reads differently in the hand than on a spec sheet.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-06-27T00:00:00.000Z",
  },
  {
    id: "faq-pad-any-rug",
    slug: "rug-pad-under-any-rug",
    category: "care",
    question: "Can I put a rug pad under any rug?",
    answer:
      "Yes, and you should. A pad protects the pile, keeps the rug from slipping, and adds years to its life. On hard floors — wood, stone, tile — we recommend a felt-and-rubber pad. Over wall-to-wall carpet, a thinner felt pad works better and keeps the rug from creeping. Cut the pad about an inch shorter than the rug on each side so it doesn't show at the edges. We stock pads in the showroom and cut to size.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-06-27T00:00:00.000Z",
  },
  {
    id: "faq-no-prices-on-site",
    slug: "why-no-prices-on-site",
    category: "quote-process",
    question: "Why don't you publish prices on the site?",
    answer:
      "Every piece is unique — condition, knot count, dye source, age, and provenance all move the number, and the right rug also depends on the room it's going into. We quote in person or by phone after we understand the use, the space, and what you're choosing between. This is consistent with how the trade has worked for a century, and it lets us be straight with you about value rather than anchoring to a sticker. Save pieces to a wishlist and we'll follow up with a clear quote.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-06-27T00:00:00.000Z",
  },

  // ── SOP starter set — draft entries added 2026-07-02 ──────────────────────
  // Every entry below is AI-drafted and marked verified: false. The concierge
  // does not retrieve unverified entries (see lib/faq/index.ts filter). An
  // editor opens each in Sanity Studio, reviews for accuracy and voice, then
  // flips verified: true to activate. Per CLAUDE.md: no AI copy publishes
  // without human review.
  //
  // Structure covers eight areas the concierge is expected to answer well:
  //   1. Consultation flow (showroom + quote-process)
  //   2. Sizing guidance
  //   3. Care & materials
  //   4. Cleaning & restoration
  //   5. Appraisal
  //   6. Memo / in-home trial
  //   7. Trade
  //   8. Delivery / logistics

  // ── 1. Consultation flow ──
  {
    id: "faq-showroom-first-visit",
    slug: "what-to-bring-first-visit",
    category: "showroom",
    question: "What should I bring to my first showroom visit?",
    answer:
      "The two things that help most are the room's dimensions (a rough sketch is plenty) and a phone photo of the space with the furniture in place. Bring a swatch of your dominant upholstery colour if you can — matching against the actual textile beats matching against a memory. Nothing else required; the team will walk you through what fits and what will suit.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-consultation-flow",
    slug: "what-happens-at-a-consultation",
    category: "showroom",
    question: "What happens when I come in for a consultation?",
    answer:
      "A team member sits with you for as long as it takes — usually thirty to sixty minutes for a first visit. They'll ask about the room, the household, the pieces you already own, and what draws you in. Then they bring out four or five candidates that fit the brief, so you're comparing real rugs rather than talking about categories. No pressure to decide the same day; memo is available on most pieces.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-quote-how-to-get",
    slug: "how-to-get-a-quote",
    category: "quote-process",
    question: "How do I get a quote?",
    answer:
      "Three paths. Save the piece to your wishlist and we'll follow up. Call either showroom directly (Chicago 312-467-1212, Evanston 847-475-0000). Or book a visit and we'll quote in person. Quotes cover the piece, delivery within the Chicago area, and any recommended padding.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },

  // ── 2. Sizing guidance ──
  {
    id: "faq-size-living-room",
    slug: "size-for-living-room",
    category: "sizing",
    question: "What size rug do I need for my living room?",
    answer:
      "The usual rule: all four legs of every seating piece should rest on the rug — that anchors the arrangement and the room reads as intentional rather than furnished-in-parts. For a standard sofa with two chairs, that typically means 8'×10' minimum, 9'×12' more often, and 10'×14' or larger for generous open plans. Measure the seating footprint plus about eighteen inches of margin on each side.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-size-dining",
    slug: "size-under-dining-table",
    category: "sizing",
    question: "What size rug goes under a dining table?",
    answer:
      "The rug should extend at least twenty-four inches beyond the table on every side so the back legs of the chairs stay on the rug when guests are seated. For a table that seats six (roughly 40\"×72\"), you want at least 8'×10'. For eight seats, 9'×12'. Square tables want square rugs; long tables want long ones.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-size-bedroom",
    slug: "size-for-a-bedroom",
    category: "sizing",
    question: "What size rug do I need for a bedroom?",
    answer:
      "Two conventions work. Either a single large rug (9'×12' or 10'×14') set so at least two feet of rug shows on each side of the bed — you step onto the rug when you get up. Or a smaller runner-shaped piece on each side, roughly 3'×5' to 3'×8'. The single-rug approach is warmer and more anchored; the twin-runner approach preserves a hardwood or stone floor beneath the bed.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-size-hallway-runner",
    slug: "size-for-a-hallway-runner",
    category: "sizing",
    question: "How wide should a hallway runner be?",
    answer:
      "Leave at least four inches of floor visible on both long sides — a runner that touches wall-to-wall reads as wall-to-wall carpet, which is a different intent. In a typical thirty-six-inch hallway that means a runner about 2'6\" wide. For length, stop about eight to twelve inches short of each end. Most floor plans want a piece somewhere between 8' and 16' long.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-size-staircase",
    slug: "runner-for-a-staircase",
    category: "sizing",
    question: "Can you help with a runner for my staircase?",
    answer:
      "Yes — staircase runners are one of the things we install regularly. We'll come out to measure the number of stairs and their nose-to-nose length, choose a runner width that leaves an inch or two of stair tread showing on both sides, and fabricate the piece with mitered borders and brass stair rods if you want them. Design, materials, and installation all handled here.",
    routing: "professional-only",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },

  // ── 3. Care & materials ──
  {
    id: "faq-care-professional-cadence",
    slug: "how-often-professional-cleaning",
    category: "care",
    question: "How often should I have my rug professionally cleaned?",
    answer:
      "Every three to five years for a rug in a normal household — wool doesn't need frequent bathing and over-cleaning can wear the pile faster than dirt does. In a home with pets, small children, or a very light-coloured piece, closer to every two to three years. Weekly suction-only vacuuming between cleanings extends the interval.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-care-moths",
    slug: "moth-prevention",
    category: "care",
    question: "How do I prevent moth damage?",
    answer:
      "Moths eat wool that sits undisturbed in the dark — under furniture, in closets, in the corner of a spare room. Rotate the rug 180° twice a year so light and vacuuming reach every part of the pile. Vacuum the underside once a year. If you store a rug, roll it (never fold) with cedar or lavender sachets in a breathable cotton wrap, and inspect it every few months. Any live infestation goes to us for professional treatment.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-care-rotate",
    slug: "should-i-rotate-my-rug",
    category: "care",
    question: "Should I rotate my rug?",
    answer:
      "Yes — twice a year is enough. Rotating spreads foot-traffic wear evenly and gives both halves equal exposure to sunlight, which fades wool over decades whether it's rotated or not. Turn it 180° each time. If a large piece is under heavy furniture, ask us to help with the rotation; it's the sort of thing worth an extra pair of hands.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-care-padding",
    slug: "do-i-need-a-rug-pad",
    category: "care",
    question: "Do I need a rug pad?",
    answer:
      "Almost always yes. A good pad keeps the rug from slipping, adds a small amount of cushion underfoot, and — most importantly — takes the wear that would otherwise happen at the contact points between the rug and the floor. The pad extends the rug's life by many years. We can recommend and cut a pad to the exact size of the piece.",
    routing: "diy-ok",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-material-hand-knotted-vs-woven",
    slug: "hand-knotted-vs-hand-woven",
    category: "materials",
    question: "What's the difference between hand-knotted and hand-woven?",
    answer:
      "Hand-knotted rugs have a pile: individual knots tied around vertical warp threads, then cut to length, producing the fuzzy face you feel underfoot. Hand-woven or flatweave rugs (kilims, dhurries, Zapotecs) have no pile — the pattern is created by the weave itself. Hand-knotted pieces are typically thicker, warmer, and heavier; flatweaves are lighter, reversible, and often less expensive to make.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-material-natural-dyes",
    slug: "are-natural-dyes-worth-it",
    category: "materials",
    question: "Are natural dyes worth it?",
    answer:
      "For a piece you want to live with for decades, yes. Natural dyes — madder red, indigo blue, walnut brown — age more beautifully than synthetics: they soften and harmonise rather than fading unevenly. They cost more up front and require more skill to apply consistently, so the pieces that carry them are often the ones the workshops treat as their finest work.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },

  // ── 4. Cleaning & restoration ──
  {
    id: "faq-service-turnaround",
    slug: "how-long-does-cleaning-take",
    category: "services",
    question: "How long does professional cleaning take?",
    answer:
      "Ten to fourteen days for a standard wool rug — cleaning is done by hand and each piece needs time to dry properly. Silk, antique, or particularly large pieces take longer; we'll give you a specific timeline when we assess the rug. Same-week rush is sometimes possible if the studio schedule allows.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-service-restoration",
    slug: "what-does-restoration-include",
    category: "services",
    question: "What does restoration include?",
    answer:
      "Restoration covers what a lifetime rug typically needs: rebuilding fringes and selvages that have worn away, reweaving small holes, colour-matching repairs that blend into the existing pile, and stabilising foundations before further damage. For antique pieces we work in a way that keeps the original character intact rather than making the rug look new. Every restoration is quoted after we see the piece; we'll walk you through what's worth doing and what isn't.",
    routing: "inspection-required",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-service-pickup",
    slug: "do-you-pick-up",
    category: "services",
    question: "Do you pick up and deliver rugs for cleaning?",
    answer:
      "Yes — pickup and delivery within the Chicago area is included with most cleaning and restoration work. Outside that radius we can arrange shipping either direction; the team will walk you through the options when you call.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },

  // ── 5. Appraisal ──
  {
    id: "faq-appraisal-what",
    slug: "what-is-an-appraisal",
    category: "services",
    question: "Do you appraise rugs I didn't buy from you?",
    answer:
      "Yes. We appraise for insurance, estate, and resale purposes on rugs regardless of where they came from. An appraisal is done in person; we look at origin, age, knot count, condition, materials, and current market — then provide a written valuation you can share with your insurer or attorney. Bring the rug in or book a home visit for large or fragile pieces.",
    routing: "inspection-required",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-appraisal-value",
    slug: "can-you-tell-me-what-my-rug-is-worth",
    category: "services",
    question: "Can you tell me what my rug is worth from a photo?",
    answer:
      "Not with any accuracy. Age, dye source, knot count, and condition all move value substantially and can't be read reliably from a photo. What we can do is give you a preliminary opinion from photos, then a proper appraisal when we see the piece. Rugs of any real value should be seen in person before any valuation is committed to paper.",
    routing: "inspection-required",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },

  // ── 6. Memo / in-home trial ──
  {
    id: "faq-memo",
    slug: "do-you-offer-in-home-trials",
    category: "services",
    question: "Can I try a rug at home before I buy?",
    answer:
      "Yes — most pieces on the floor can go home on memo. The rug spends a few days in your room so you can see how the colours read in your light and how the piece sits with the furniture. Return with no obligation if it isn't the right fit. We'll walk through the practical details (duration, delivery, condition on return) when you call.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },

  // ── 7. Trade program ──
  {
    id: "faq-trade-overview",
    slug: "trade-program-overview",
    category: "trade",
    question: "What is the Isberian trade program?",
    answer:
      "The trade program supports interior designers, architects, and stagers who source rugs for client projects. Members get a dedicated point of contact, memo across both showrooms, priority on new arrivals, and trade-preferred pricing. The most common use case is speeding up the sample-and-approve cycle when a project deadline is tight.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-trade-enroll",
    slug: "how-to-enroll-in-trade",
    category: "trade",
    question: "How do I enroll in the trade program?",
    answer:
      "Send us your business licence or resale certificate along with a few reference projects. We confirm within a business day and set up your account. Nothing to sign — the relationship is a working one, not a contract.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },

  // ── 8. Delivery / logistics ──
  {
    id: "faq-logistics-delivery",
    slug: "do-you-deliver",
    category: "logistics",
    question: "Do you deliver?",
    answer:
      "Yes — delivery within the Chicago metropolitan area is included with every purchase. Two team members bring the rug, unroll it in the room you're using it in, and take away the packing. Outside that radius, we ship white-glove either coast; the quote covers freight and insurance.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-logistics-shipping",
    slug: "do-you-ship-nationally",
    category: "logistics",
    question: "Do you ship rugs across the country?",
    answer:
      "Yes. We ship rugs anywhere in the United States and — with some paperwork — internationally. Domestic delivery is fully insured door-to-door. International shipments go through freight partners we've used for years; the team will walk you through the specifics once we know the destination and the piece.",
    routesToHuman: true,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "faq-logistics-padding",
    slug: "do-you-install-padding",
    category: "logistics",
    question: "Do you install rug padding when you deliver?",
    answer:
      "Yes. When you order padding with a rug, it's cut to the exact size of the piece and laid down under the rug during delivery. If you're bringing a rug back home after cleaning, we can also install padding then. The team will size the pad correctly — a pad that's too large or too small does more harm than good.",
    routesToHuman: false,
    verified: false,
    updatedAt: "2026-07-02T00:00:00.000Z",
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
