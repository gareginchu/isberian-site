import type { Rug } from "@/lib/types/rug";
import type { RugSearchFilters } from "./types";

/**
 * The catalog data-access contract. Every implementation — fixture today, Postgres tomorrow —
 * answers the same questions; downstream code (`/lib/search`, `/app/rugs`, `/lib/ai`) never knows
 * which is wired in.
 *
 * The three primary methods (`listRugs`, `getRug`, `searchRugs`) are the named contract from the
 * "Inventory feed — the critical dependency" section in CLAUDE.md. The auxiliary methods
 * (`getRugById`, `findSimilar`, `listCollections`) cover the existing call sites and move
 * behind the same interface so the swap to Postgres is a single seam.
 */
export interface CatalogSource {
  /** All publishable rugs (drafts excluded). Order is implementation-defined; callers sort. */
  listRugs(): Promise<Rug[]>;

  /** Single rug by public slug. Returns null if missing or still in draft. */
  getRug(slug: string): Promise<Rug | null>;

  /**
   * Free-text + faceted search over the catalog. Real records only — never improvises stock.
   * `limit` is advisory; sources may cap (the fixture source caps at 8 to mirror current behavior).
   */
  searchRugs(query: string, filters?: RugSearchFilters, limit?: number): Promise<Rug[]>;

  /** Single rug by internal id (e.g. `rug-17109`). Returns null if missing or still in draft. */
  getRugById(id: string): Promise<Rug | null>;

  /**
   * Visual-similarity lookup. In production this is a pgvector `<->` query against the image
   * embedding of the source rug. In dev it falls back to a hand-crafted "near" rule.
   */
  findSimilar(rugId: string, limit?: number): Promise<Rug[]>;

  /** Editorial collections (slug + title). Used by /rugs grid filters and the home page. */
  listCollections(): Promise<{ slug: string; title: string }[]>;
}
