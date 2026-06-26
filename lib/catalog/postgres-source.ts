import type { Rug } from "@/lib/types/rug";
import type { CatalogSource } from "./source";
import type { RugSearchFilters } from "./types";

/**
 * Typed stub for the dedicated Postgres catalog source.
 *
 * Activated by setting `CATALOG_SOURCE=postgres` in the environment (see `.env.example`). Until
 * the DB lands every method throws — this is intentional: if a deploy flips the env var before
 * the DB and the row-to-domain mapper are ready, the failure must be loud and immediate, not a
 * silent fall-through to fixtures in production.
 *
 * Implementation plan (when the DB is real):
 *   1. Pick a client lib (`pg` + `kysely`, or `drizzle`, or `postgres.js`) — decision deferred
 *      until the actual DB / hosting / pooling story is known.
 *   2. Translate the SQL described in `lib/catalog/schema.md` into typed queries.
 *   3. Hydrate the nested `RugDescription` shape from the flat `rugs` row plus the four child
 *      tables (images, color chips, design features, distinguishing notes) so downstream code
 *      sees exactly the same shape it gets from `FixtureCatalogSource`.
 *   4. `searchRugs` becomes hybrid: pgvector `<->` over `text_embedding` ∩ SQL facet filters,
 *      re-ranked and capped at `limit`.
 *   5. `findSimilar` becomes one pgvector query over `image_embedding`.
 *
 * NOTE: We intentionally do NOT add `pg` / `kysely` / `drizzle` to package.json yet — that
 * decision waits until the DB hosting and pooling story is locked.
 */
export class PostgresCatalogSource implements CatalogSource {
  private unconfigured(method: string): never {
    throw new Error(
      `PostgresCatalogSource.${method} called but Postgres catalog source is not yet configured. ` +
        `Set CATALOG_SOURCE=fixture for dev, or finish wiring the Postgres client (see lib/catalog/schema.md).`,
    );
  }

  async listRugs(): Promise<Rug[]> {
    this.unconfigured("listRugs");
  }

  async getRug(_slug: string): Promise<Rug | null> {
    this.unconfigured("getRug");
  }

  async getRugById(_id: string): Promise<Rug | null> {
    this.unconfigured("getRugById");
  }

  async searchRugs(_query: string, _filters?: RugSearchFilters, _limit?: number): Promise<Rug[]> {
    this.unconfigured("searchRugs");
  }

  async findSimilar(_rugId: string, _limit?: number): Promise<Rug[]> {
    this.unconfigured("findSimilar");
  }

  async listCollections(): Promise<{ slug: string; title: string }[]> {
    this.unconfigured("listCollections");
  }
}
