import { sanity } from "@/lib/sanity/client";

export type JournalEntry = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string; // ISO
  author: string;
  tags: string[];
};

export const journalEntries: JournalEntry[] = [
  {
    slug: "reading-a-heriz",
    title: "Reading a Heriz",
    excerpt:
      "How village weavers from the slopes above Tabriz simplified a court vocabulary into something more direct — and why those choices have aged well.",
    body:
      "The Heriz rug is often the first piece a serious collector falls for, and the reason is usually drawing. The village weavers above Tabriz inherited a court vocabulary — medallions, spandrels, palmette borders — and simplified it without softening it. The medallion squares its shoulders. The spandrels step.\n\nWhat ages well is restraint. A Heriz never tries to be a Tabriz. The wool is heavier, the pile thicker, the palette pulled from local pots: madder reds, abrashed indigos, undyed ivory. A century later that decision still reads cleanly.\n\nIf you want to test a Heriz, look at three places: the corners, where the spandrel meets the field; the main border, for the rhythm of the lattice; and the back, where you can see the foundation hold up under decades of use.",
    publishedAt: "2026-05-22T00:00:00.000Z",
    author: "Editorial",
    tags: ["Persian", "Heriz", "Reading the rug"],
  },
  {
    slug: "what-an-overdye-is-and-isnt",
    title: "What an overdye is — and isn't",
    excerpt:
      "Overdyed rugs are a real category with a real practice behind them. They're also a place where buyers get confused. A short note on what to ask for.",
    body:
      "An overdyed rug starts as an existing rug — usually mid-century, often Turkish — and is bleached and re-dyed to a single tonal field. Done well, the original drawing reads as a soft ghost on a calm ground.\n\nWhat to ask: what was the base rug, where was it made, what age. A clean overdye respects the base. An imitation skips that step and you end up with a flat panel of color on a thin synthetic.\n\nThese are some of the easiest pieces to live with — particularly under a sofa or under a dining table. They're contemporary in mood and traditional in construction.",
    publishedAt: "2026-04-10T00:00:00.000Z",
    author: "Editorial",
    tags: ["Contemporary", "Overdye"],
  },
  {
    slug: "the-cleaning-studio",
    title: "Inside the cleaning studio",
    excerpt:
      "Why hand cleaning by trained specialists is different from a steam-cleaner truck — and what we look for before water touches a rug.",
    body:
      "Cleaning a hand-knotted rug is a craft. Before water, the rug is dusted on a beater, which removes the soil that's worked into the foundation; that's what causes wear over time, not surface dirt.\n\nThe next step is testing. We check dye stability at the corners and the back. Antique pieces and naturally dyed pieces get a different treatment — low moisture, color-stable rinses, controlled drying. Silk gets a different one again.\n\nWhat we don't do: blanket methods. The wrong rinse on the wrong rug can shift dyes permanently. The wrong dryer leaves a piece off-square. The wrong order leaves dust in the foundation. It's worth the slow approach.",
    publishedAt: "2026-03-05T00:00:00.000Z",
    author: "Editorial",
    tags: ["Care", "Services"],
  },
];

const JOURNAL_QUERY = /* groq */ `*[_type == "journalEntry"] | order(publishedAt desc) {
  "slug": slug.current,
  title,
  excerpt,
  body,
  "publishedAt": publishedAt,
  author,
  tags
}`;

async function fetchJournal(): Promise<JournalEntry[]> {
  const client = sanity();
  if (!client) return journalEntries;
  try {
    const live = await client.fetch<JournalEntry[]>(JOURNAL_QUERY);
    return live?.length ? live : journalEntries;
  } catch (err) {
    console.warn("[journal] Sanity fetch failed, falling back to fixtures", err);
    return journalEntries;
  }
}

// Synchronous list/get retained for places that called them at build time (e.g. metadata, sitemap).
// New async variants prefer Sanity when configured. Pages should migrate to the async forms.
export function listJournal() {
  return [...journalEntries].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getJournal(slug: string) {
  return journalEntries.find((j) => j.slug === slug) ?? null;
}

export async function listJournalAsync(): Promise<JournalEntry[]> {
  const all = await fetchJournal();
  return [...all].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getJournalAsync(slug: string): Promise<JournalEntry | null> {
  const all = await fetchJournal();
  return all.find((j) => j.slug === slug) ?? null;
}
