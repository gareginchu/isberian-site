import type { Rug } from "@/lib/types/rug";
import { fixtureRugs, collections } from "./fixtures";

/**
 * Catalog adapter. In v1 reads from in-memory fixtures; on ingestion this becomes a thin layer
 * over Postgres + pgvector. The shape of these calls is the contract used by /lib/search, the
 * concierge orchestrator, and every page.
 */

export async function listRugs(): Promise<Rug[]> {
  return fixtureRugs.filter((r) => !r.draft);
}

export async function getRug(slug: string): Promise<Rug | null> {
  return fixtureRugs.find((r) => r.slug === slug && !r.draft) ?? null;
}

export async function getRugById(id: string): Promise<Rug | null> {
  return fixtureRugs.find((r) => r.id === id && !r.draft) ?? null;
}

export async function listCollections() {
  return collections;
}

/**
 * Visual-similarity stub. With pgvector wired, this becomes a `<->` query against the image
 * embedding of the source rug. Here we fall back to a hand-crafted "near" rule: same collection
 * or shared origin, excluding the source piece.
 */
export async function findSimilar(rugId: string, limit = 4): Promise<Rug[]> {
  const src = await getRugById(rugId);
  if (!src) return [];
  const pool = (await listRugs()).filter((r) => r.id !== rugId);
  const scored = pool.map((r) => {
    let score = 0;
    if (r.collection && r.collection === src.collection) score += 3;
    if (r.description.provenance.origin === src.description.provenance.origin) score += 2;
    const sharedColors = r.description.colorPalette.filter((c) =>
      src.description.colorPalette.some((sc) => sc.name === c.name),
    ).length;
    score += sharedColors;
    return { r, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.r);
}
