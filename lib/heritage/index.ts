import { sanity } from "@/lib/sanity/client";

/**
 * Heritage entries are evergreen, region-organized reference material — orientations to the
 * major weaving traditions we sell. They are part of the AEO substrate and ground concierge
 * answers about provenance, regions, and what "antique" means at Isberian. Voice and rules are
 * the same as everything else: specific where defensible, restrained where not, no prices, no
 * fabricated provenance for hypothetical pieces.
 *
 * Until Sanity is wired, these fixtures are the source of truth. Shape mirrors journal so the
 * editor workflow and renderer can be shared.
 */

export type HeritageEntry = {
  slug: string;
  title: string;
  excerpt: string;
  body: string; // markdown (## headings + paragraphs)
  publishedAt: string; // ISO
  author: string;
  tags: string[];
  /** Editorial review state. Scaffolded drafts publish false until an editor signs off. */
  verified: boolean;
};

export const heritageEntries: HeritageEntry[] = [
  {
    slug: "antique-persian-rugs-what-to-look-for",
    title: "Antique Persian rugs: what to look for",
    excerpt:
      "An orientation to Tabriz, Heriz, Sarouk, and Kerman — four of the Persian traditions that shape most of what comes through the showroom.",
    body:
      "Persian rug-making is not a single tradition. It is a network of regional schools that overlapped, traded weavers, and refined different ideas about what a rug should be. Four are worth knowing first.\n\n## Tabriz\nTabriz is a workshop tradition from the northwest of Iran. The drawing is meticulous — curvilinear medallions, herati and shah-abbasi vocabularies, fine borders. Knot counts run high; the wool is firm; the palette is broad. A Tabriz is a piece that rewards close looking. The fine end of the tradition is closer to painting than to weaving in feel.\n\n## Heriz\nHeriz comes from the villages above Tabriz, on slopes that produce a heavier, more lustrous wool. The vocabulary is inherited from the court schools — medallions, spandrels, palmette borders — but simplified and squared off. A Heriz is bolder, more architectural, and ages exceptionally well; it absorbs use rather than showing it.\n\n## Sarouk\nSarouk is a central-Iranian tradition, woven in a region west of Tehran. The pile is dense; the drawing is floral; the reds tend toward a deep brick or burgundy that softens over decades. The American Sarouks of the early 20th century — woven specifically for the U.S. market — are a distinct sub-category, and many of those pieces are now genuinely antique.\n\n## Kerman\nKerman is a southeastern workshop tradition. The wool is soft; the palette favors ivories, pale blues, rose, and soft greens; the drawing leans pictorial — open fields, vase compositions, hunting scenes. A Kerman in good condition has a quiet, gracious presence.\n\n## What 'antique' means at Isberian\nWe use the term in its trade sense: typically 75 years or older, with the condition, materials, and drawing to support the description. Borderline pieces — semi-antique, 50-to-75 years — we describe as such. We don't apply 'antique' as a sales adjective to newer work, and we don't speculate on age beyond what the piece itself supports.\n\nIf you want to learn to read these traditions in person, come into the showroom. A short visit with rugs on the floor teaches more than any written orientation.",
    publishedAt: "2026-06-27T00:00:00.000Z",
    author: "Editorial",
    tags: ["Persian", "Antique", "Reference"],
    verified: false,
  },
  {
    slug: "antique-caucasian-rugs-a-quick-orientation",
    title: "Antique Caucasian rugs: a quick orientation",
    excerpt:
      "Kazak, Karabagh, Shirvan, Daghestan — the tribal and village weaves of the Caucasus, and what to expect when you encounter them.",
    body:
      "The Caucasus is a band of mountains and valleys between the Black and Caspian seas, with weaving traditions spread across what are now Azerbaijan, Armenia, Georgia, and southern Russia. Caucasian rugs are predominantly tribal and village work — geometric, direct, and unmistakable.\n\n## Kazak\nKazak rugs are woven in the southern Caucasus and northern Armenia. The drawing is large-scale and geometric: bold medallions, stepped polygons, animal and tree motifs simplified to their essential silhouettes. The pile is long; the wool is lustrous; the palette is anchored by deep madder red, indigo, and undyed ivory. A Kazak is meant to read across a room.\n\n## Karabagh\nKarabagh weaves come from the region of the same name in what is now southwestern Azerbaijan and eastern Armenia. The tradition runs from village pieces with simple geometric vocabularies to more workshop-influenced rugs with floral elements borrowed from Persian neighbors. The reds tend warm; the format is often long and narrow.\n\n## Shirvan\nShirvan rugs come from the eastern Caucasus along the Caspian coast. They are finer than Kazaks — shorter pile, smaller-scale drawing, more disciplined borders. Prayer-format pieces are common in the tradition. The blues and ivories tend to dominate the palette; the overall character is precise without being formal.\n\n## Daghestan\nDaghestan, further north along the Caspian, produces some of the most finely woven pieces of the Caucasian tradition. Lattice fields, small-scale repeating motifs, and a particularly clean drawing of borders are characteristic. Many surviving antique pieces are smaller-format prayer rugs.\n\n## What to expect\nMost antique Caucasian rugs that come through trade are 19th-century or early-20th-century pieces. Condition varies: these were household rugs, not court objects, and they were used. Even pieces with even wear or minor restoration retain their drawing and their character. We describe condition specifically — old repairs, areas of low pile, period-appropriate dye choices — rather than glossing it.\n\nIf you are drawn to the tribal aesthetic, the showroom is the right place to start. The drawing and the wool change character on the floor in a way photos can only suggest.",
    publishedAt: "2026-06-27T00:00:00.000Z",
    author: "Editorial",
    tags: ["Caucasian", "Antique", "Reference"],
    verified: false,
  },
  {
    slug: "antique-turkish-rugs-anatolian-weaves",
    title: "Antique Turkish rugs: Anatolian weaves",
    excerpt:
      "Konya, Sivas, Oushak, Hereke — village and workshop weaves from across Anatolia, and how to tell them apart.",
    body:
      "Turkish rug-making — Anatolian weaving — runs across a wide geographic and stylistic range, from village pieces with deep tribal roots to court workshops that rivaled the finest Persian production. Four traditions cover most of what comes through the showroom.\n\n## Konya\nKonya is a central Anatolian region with one of the oldest continuous weaving traditions in the world. The rugs are village work: symmetrical (Turkish) knot, long lustrous pile, large-scale geometric drawing. The palette runs warm — madder red, soft yellow, undyed ivory and brown. Konya prayer rugs and long runners are characteristic.\n\n## Sivas\nSivas is further east, and the tradition shifted over the 19th and 20th centuries from village production toward more workshop-style weaving, often influenced by Persian drawing. Sivas pieces tend to be finer than Konya, with more elaborate medallions and borders, but they keep the Turkish knot and the Anatolian palette.\n\n## Oushak\nOushak is a western Anatolian tradition that has been woven, in various forms, for several centuries. Antique Oushaks — late 19th-century into the early 20th — are particularly recognized: large-scale floral and medallion drawing, a soft wool that takes light beautifully, palettes built around saffron yellow, soft red, pale blue, and ivory. They sit well in contemporary rooms and have been a quiet favorite of designers for decades.\n\n## Hereke\nHereke is the exception — a court workshop founded in the 19th century near Istanbul, producing rugs at the finest end of Anatolian work. Knot counts are very high; wool and silk pieces both come out of Hereke; the drawing borrows from Persian, Mamluk, and Ottoman vocabularies. Antique Hereke pieces in good condition are uncommon and the silk pieces in particular require professional handling.\n\n## Village versus workshop\nThe useful distinction across all of these is village versus workshop. Village pieces are woven on simple looms by a small number of hands; the drawing has variation, the palette is regional, and the character is direct. Workshop pieces are coordinated production, often to a designer's cartoon; the drawing is precise and consistent, and the materials are finer. Neither is better — they are different intentions, and they live in different rooms.\n\nThe showroom is the right place to learn to tell them apart. We are happy to set out a few examples side by side.",
    publishedAt: "2026-06-27T00:00:00.000Z",
    author: "Editorial",
    tags: ["Turkish", "Anatolian", "Antique", "Reference"],
    verified: false,
  },
];

const HERITAGE_QUERY = /* groq */ `*[_type == "heritageEntry"] | order(publishedAt desc) {
  "slug": slug.current,
  title,
  excerpt,
  body,
  publishedAt,
  author,
  tags,
  verified
}`;

async function fetchHeritage(): Promise<HeritageEntry[]> {
  const client = sanity();
  if (!client) return heritageEntries;
  try {
    const live = await client.fetch<HeritageEntry[]>(HERITAGE_QUERY);
    return live?.length ? live : heritageEntries;
  } catch (err) {
    console.warn("[heritage] Sanity fetch failed, falling back to fixtures", err);
    return heritageEntries;
  }
}

export function listHeritage() {
  return [...heritageEntries].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getHeritage(slug: string) {
  return heritageEntries.find((h) => h.slug === slug) ?? null;
}

export async function listHeritageAsync(): Promise<HeritageEntry[]> {
  const all = await fetchHeritage();
  return [...all].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getHeritageAsync(slug: string): Promise<HeritageEntry | null> {
  const all = await fetchHeritage();
  return all.find((h) => h.slug === slug) ?? null;
}
