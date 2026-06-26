# Isberian on the modern web

## A report on the new site, in plain language

*Prepared for Oscar Isberian Rugs · 2026-06-27*

---

## The bottom line

For a hundred years the way to know Oscar Isberian Rugs has been to walk into the showroom. That doesn't change. What changes is how people *find* you before they walk in.

A buyer today asks an AI assistant — Claude, ChatGPT, Perplexity, Google's AI Overviews — *"Where can I find an antique Heriz in Chicago?"* The current isberian.com loads its inventory through a browser script, which means assistants can't read it. To them, your inventory page reads "Total Results: 0." A hundred years of catalog, invisible.

The new site fixes that without changing how you do business. Every rug is in the page the way a human reads it — so AI assistants and search engines can recommend you. Every visit converts to the same human outcome: a phone call, a showroom appointment, or a quote request. We never publish a price, we never invent stock, and we never tell anyone to clean a silk rug with dish soap.

---

## What's actually new

### 1. You can be found by AI agents

The single biggest change. The new site is **server-rendered** — every catalog page returns the full content the moment it's requested, with no browser script needed. AI assistants read it, summarize it, and direct people to you.

Each rug carries **structured information** in a format AI agents understand natively: title, origin, age, size, materials, weave, condition, color palette. They can answer questions like "Which Chicago dealer has antique Caucasian rugs under 6×9?" by reading your catalog directly.

**Why it matters:** the next generation of customers will increasingly start their search by asking an assistant, not by typing into Google. If your site is invisible to those assistants, you're invisible to that audience. The new site is built so you show up when it matters.

### 2. A concierge that knows the house voice

A small chat surface sits in the corner of every page. It's powered by Claude, and it speaks in your house voice — warm, precise, unhurried, never pushy. It knows:

- The catalog (it can name only rugs that actually exist on your floor).
- Rug care, in restrained language (it will never recommend household cleaners on a silk or antique piece).
- The showrooms, the phones, and the booking path.
- When to stop and route a serious question to a human — "let me connect you with a specialist."

**Why it matters:** people land on your site at 11 PM. They have a question — "is this rug appropriate for a hallway with a dog?" In the old world, that question went unanswered and the visit didn't happen. The concierge answers in your voice and books the showroom visit.

### 3. Photo triage for rug care and identification

Two related surfaces, both vision-based:

- **`/identify`** — a customer uploads photos of a piece they own. Claude returns a *preliminary* read of origin, age band, and type. Always preliminary. The report ends with a clear handoff to your in-showroom appraiser. We never appraise, value, or guarantee authenticity from photos.
- **`/services/triage`** — a customer photographs damage (wear, moth, fringe, stain) and adds a short note. Claude returns the issue and severity band, then routes them — drop-off, house call, or showroom inspection. Never DIY for valuable, antique, or silk pieces.

**Why it matters:** these surfaces turn idle curiosity into a service inquiry without committing your time. The triage is always preliminary. The expertise stays in the showroom where it belongs.

### 4. Real rug pages, structured by hand

Every rug page renders a structured description block: a short lead paragraph, the technical details, the color palette as visible chips, the design features, what distinguishes the piece, and the provenance. AI drafts each block from the catalog data — an editor verifies before publish, and any unverified origin/age/knot-count claim stays visibly flagged.

No empty superlatives. No "exquisite … masterpiece." Specificity, restraint.

**Why it matters:** rug descriptions on most sites are interchangeable marketing prose. Yours are factual, specific, and machine-readable — which means search engines and AI agents understand them, surface them, and direct serious buyers to them.

### 5. A care knowledge base, grounded in your practice

A library of short articles on care, materials, sizing, services, logistics, and the quote process. The concierge cites them when it answers care questions, so we never improvise. Antique and silk pieces always route to a specialist, never DIY.

**Why it matters:** customers searching for "how do I clean a Persian rug" land on real, restrained guidance — written in your voice — and book a service appointment rather than ruining the rug. Each article doubles as the substrate AI agents draw on when someone asks them the same question.

### 6. The showroom path, on every page

A book-a-visit link, a Chicago phone, an Evanston phone — visible on every surface. The concierge mentions them too. There is no path on the site that doesn't end in a human option.

**Why it matters:** the business model is built on the showroom visit. Every site decision points toward it.

### 7. Crawlable previews on social and chat

When a customer shares a rug page on iMessage, Slack, Pinterest, LinkedIn — the share preview shows **the rug itself**, photographed against your brand mark, sized correctly. The old site shared the grey logo for every page. We share the rug.

**Why it matters:** quiet but compounding. Every shared link is a small ad. Showing the rug instead of the logo turns shares into clicks.

---

## What stays exactly the same

- The business model. Quoted only. No public prices. No anonymous checkout. No consumer accounts beyond email-based wishlists.
- The heritage tone. Master dealer, century of family practice. No emoji. No hype.
- The catalog truth. Only real rugs, with the real upstream record.
- The showrooms — both — with real hours and real phones.
- The five rules that gate every AI surface: no prices, no fabricated inventory, no valuations, no risky DIY, always a visible human exit.

---

## What we deliberately did *not* build

These are designed and waiting. Phase 2 or 3.

- **Room visualizer** — drop a rug into a photograph of your room. Needs the color-accurate photography pass.
- **Visual search** — "show me rugs that go with this fabric swatch." Same photography prerequisite.
- **Trade portal** — designer logins, holds, memos. Needs operations process design.
- **Custom rug studio** — generative drafts for commissioned work.

We didn't pull them forward without sign-off. They're real options for next year.

---

## The single dependency in the way

The current isberian.com catalog lives in an external inventory system. The new site has been built against a small set of representative rugs (46 of them, real records, real photos), with a typed data layer ready to connect.

For the new site to show the *full* catalog, that upstream system needs to expose a feed or be replicated into a dedicated catalog database. We've documented the data contract, written the connector, and stubbed both paths. The work to take it from 46 rugs to your full inventory is one focused engagement once the data path is decided.

This is the only blocking dependency between the MVP and a launch you'd be comfortable with.

---

## Why this matters, in one paragraph

The world that bought rugs from a phonebook has been replaced by a world that asks an assistant. The new isberian.com is the first version of the site that can answer that assistant honestly, in your voice, without compromising the showroom-first business that's worked for a century. The five rules that govern your floor now govern every line of code. Nothing about the way you sell rugs has changed. Everything about the way buyers can find you has.

---

## What's live now

You can see and use everything described above at **https://isberian-site-qbj6.vercel.app**. Until DNS lands at the real domain, that's the address. Every change ships there within two minutes.

The catalog at the moment shows 46 rugs (curated from your existing photos). When the upstream feed lands, the same site will show the full inventory automatically — no rebuild, no rewrite.
