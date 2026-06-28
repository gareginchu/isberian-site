# Cover note — to Oscar Isberian

> Plain prose to accompany the report, deck, and specification when sending to Oscar.
> Refine the salutation, signature, and any sentence that doesn't sound like you.

---

Subject: **New site — three things to read, in any order**

Oscar,

The new site has moved on enough that it's worth your eye on it again. Three short documents go with this — none of them is engineering reading. Take them in whatever order suits the moment.

**Plain-language report** — `isberian-new-features-report.docx`. The fastest read. One feature per page: the concierge, identify-a-rug, service triage, 3D and augmented reality, the imagined-in-your-room lifestyle row, the structured rug descriptions (now editable live from the browser), the care knowledge base, the five rules, and the search/performance work. Written for the showroom floor, not for engineers.

**Visual deck** — `isberian-new-features-deck.pptx`. The same content as slides with screenshots. The right thing to bring into a conversation with the team, or with a partner who needs a single sitting to understand what's been built.

**Specification** — `isberian-new-site-specification.docx`. Plainspoken but more complete. Eleven sections — purpose, audience, every feature with what it does, why it matters, what it will never do, and when it's considered done; the editorial rules codified; the technical architecture in non-engineering terms; what's deliberately out of scope; and the gates that block any deployment. The document a future hire or consultant would read to understand the whole picture.

The build itself is live at **isberian-site-qbj6.vercel.app**. A few pages worth clicking through:

- The **home page** for the brand register and the prominent "Ask anything" pill anchored over the hero — click it and the concierge opens in place, the carousel still visible behind it.
- Any **rug detail page** — the rug number at the top (the way the showroom has always referred to a piece), the structured description, the 3D viewer with its zoom and rotate controls, the AR button that opens the rug in your room on a phone, the QR code for visitors on a laptop, and the four-room lifestyle strip below — the same rug imagined in a library, a modern living room, a dining room, and a bedroom.
- The **/curator** page — a private editing surface for the catalog. Hidden from search engines, not linked from anywhere on the public site. Edit a rug's title, palette, description, age, anything; save lands on the public site within roughly half a minute.
- The **/discover** page if you want a longer conversation with the concierge.
- The **/identify** and **/services/triage** pages for the vision-based intake tools.

Three notes on what changed since the last time you looked:

1. **The catalog is now real.** Forty-nine rugs, ingested directly from your live inventory feed (so sizes, origins, and materials match the showroom's records), with prose drafted by the AI vision pass and ready for editorial review. The earlier prototype ran on thirty hand-curated demo pieces; that's behind us.

2. **The catalog is now editable live.** Behind the scenes the rugs sit in a hosted editorial system (Sanity). The editor opens any rug, edits a sentence, hits Publish — the public site reflects the change within about thirty seconds. No developer involved, no deployment cycle, no risk of overwriting a colleague's draft.

3. **AR and 3D work on every rug, not just a demo piece.** Every rug page has a working 3D viewer with controls visible over the canvas, and "View in your space" works on both iPhone and Android. We verified independently that each model carries the rug's real-world dimensions to within one percent.

Two things I'd still want to talk through whenever it's easy:

1. **Status sync from the showroom.** The catalog now pulls from your inventory feed, but "available", "on memo", and "sold" still rely on someone updating them in the editor. To keep those states accurate without manual touches, the new site needs a live link to the showroom's status system. That's a one-meeting decision with the inventory team.

2. **Phase 2 and Phase 3 sign-off.** Three pieces still designed but not built: the visitor's-own-room visualizer (the lifestyle row in this build is a precursor — the next step lets a customer drop their own photo in), the trade portal and trade copilot, and an original hero photography pass for the home and category tiles. Worth ranking these together in person.

Whenever's easiest. I can walk through any of it with you live, in person or on a call — half an hour with the site open is faster than any deck.

— [Your name]
