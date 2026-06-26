import type { Rug } from "@/lib/types/rug";
import type { CatalogSource } from "./source";
import type { RugSearchFilters } from "./types";
import { fixtureRugs, collections } from "./fixtures";

/**
 * Dev-mode catalog source. Reads from the in-memory fixtures in `./fixtures`. This is the
 * default until the dedicated Postgres catalog DB is provisioned and `CATALOG_SOURCE=postgres`
 * is set; see `lib/catalog/schema.md` and `lib/catalog/index.ts`.
 *
 * Behavior here mirrors the previous flat exports in `lib/catalog/index.ts` exactly — no logic
 * changes, just moved behind the `CatalogSource` interface so the Postgres source can be a clean
 * drop-in.
 */
export class FixtureCatalogSource implements CatalogSource {
  async listRugs(): Promise<Rug[]> {
    return fixtureRugs.filter((r) => !r.draft);
  }

  async getRug(slug: string): Promise<Rug | null> {
    return fixtureRugs.find((r) => r.slug === slug && !r.draft) ?? null;
  }

  async getRugById(id: string): Promise<Rug | null> {
    return fixtureRugs.find((r) => r.id === id && !r.draft) ?? null;
  }

  async listCollections() {
    return collections;
  }

  /**
   * Visual-similarity stub. Same hand-crafted "near" rule as the previous flat export: same
   * collection or shared origin or shared color names, excluding the source piece. When pgvector
   * is wired this is one `<->` query against the image embedding.
   */
  async findSimilar(rugId: string, limit = 4): Promise<Rug[]> {
    const src = await this.getRugById(rugId);
    if (!src) return [];
    const pool = (await this.listRugs()).filter((r) => r.id !== rugId);
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

  /**
   * Token-overlap + facet search. Approximates the production hybrid (pgvector semantic + SQL
   * facets) closely enough to keep callers honest about the shape. The richer scorer in
   * `/lib/search` still wraps this layer; this method exists so the catalog interface is
   * self-contained and the Postgres source can plug in without forcing every caller through
   * the search module.
   */
  async searchRugs(query: string, filters?: RugSearchFilters, limit = 6): Promise<Rug[]> {
    const all = await this.listRugs();
    const terms = tokenize(query);
    const scored = all
      .filter((r) => passesFilters(r, filters))
      .map((r) => ({ r, score: scoreRug(r, terms) }))
      .filter((s) => s.score > 0 || terms.length === 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.min(limit, 8)).map((s) => s.r);
  }
}

// ── Local helpers ─────────────────────────────────────────────────────────────
// Kept private to this source; the canonical scorer used by /lib/search has its own copy
// because it also exposes colorFamilyOf / sizeBandOf to the grid. Divergence is fine —
// the Postgres source will replace both.

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "for", "with", "in", "on", "to", "is", "are",
  "my", "our", "we", "i", "you", "your", "have", "has", "rug", "rugs",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function scoreRug(rug: Rug, terms: string[]): number {
  if (terms.length === 0) return 0;
  const haystack = [
    rug.title,
    rug.description.lead,
    rug.description.designFeatures.join(" "),
    rug.description.distinguishing.join(" "),
    rug.description.colorPalette.map((c) => c.name).join(" "),
    rug.description.provenance.origin,
    rug.description.provenance.region ?? "",
    rug.description.details.materials.join(" "),
    rug.description.details.technique,
  ]
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (haystack.includes(t)) score += 2;
    else if (haystack.split(/\s+/).some((w) => w.startsWith(t))) score += 1;
  }
  return score;
}

function passesFilters(rug: Rug, filters?: RugSearchFilters): boolean {
  if (!filters) return true;
  if (filters.origin?.length && !filters.origin.includes(rug.description.provenance.origin)) return false;
  if (filters.technique?.length && !filters.technique.includes(rug.description.details.technique)) return false;
  if (filters.status?.length && !filters.status.includes(rug.status)) return false;
  if (filters.materials?.length) {
    const mats = rug.description.details.materials;
    if (!filters.materials.some((m) => mats.includes(m))) return false;
  }
  return true;
}
