import type { Rug } from "@/lib/types/rug";
import type { CatalogSource } from "./source";
import type { RugSearchFilters } from "./types";
import { FixtureCatalogSource } from "./fixture-source";
import { PostgresCatalogSource } from "./postgres-source";
import { SanityCatalogSource } from "./sanity-source";

/**
 * Catalog adapter — the single seam between the rest of the app and whichever source backs the
 * inventory. Per CLAUDE.md → "Inventory feed — the critical dependency", Plan A is a real
 * Postgres feed; Plan B is the current fixture-backed dev mode. This module picks one based on
 * `CATALOG_SOURCE` and re-exports the three contract methods plus the auxiliary ones the app
 * already depends on, so call sites under /app and /lib stay untouched.
 *
 * Default: `fixture` (dev). Set `CATALOG_SOURCE=sanity` to read from the Sanity-backed CMS
 * (live editorial). `CATALOG_SOURCE=postgres` is reserved for the Plan A direct DB path.
 */

function selectSource(): CatalogSource {
  const choice = (process.env.CATALOG_SOURCE ?? "fixture").toLowerCase();
  if (choice === "sanity") {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      // eslint-disable-next-line no-console
      console.warn(
        `[catalog] CATALOG_SOURCE=sanity but NEXT_PUBLIC_SANITY_PROJECT_ID is missing. Falling back to "fixture".`,
      );
      return new FixtureCatalogSource();
    }
    return new SanityCatalogSource();
  }
  if (choice === "postgres") return new PostgresCatalogSource();
  if (choice !== "fixture") {
    // Unknown value → fall back to fixtures rather than crash dev. Log once so it's not silent.
    // eslint-disable-next-line no-console
    console.warn(
      `[catalog] Unknown CATALOG_SOURCE="${process.env.CATALOG_SOURCE}". Falling back to "fixture".`,
    );
  }
  return new FixtureCatalogSource();
}

// Module-level singleton — cheap to construct and stateless today; with Postgres this also
// gives us one place to hang the connection pool.
const source: CatalogSource = selectSource();

/** Re-export the selected source instance for callers that want the full interface. */
export function getCatalogSource(): CatalogSource {
  return source;
}

export type { CatalogSource } from "./source";
export type { RugSearchFilters } from "./types";

// ── Public flat API ──────────────────────────────────────────────────────────
// Existing call sites (under /app, /lib/search, /lib/ai) import these directly. Their
// signatures match the previous implementation 1:1 — the only change is that the implementation
// now lives behind `CatalogSource` and is swappable via `CATALOG_SOURCE`.

export async function listRugs(): Promise<Rug[]> {
  return source.listRugs();
}

export async function getRug(slug: string): Promise<Rug | null> {
  return source.getRug(slug);
}

export async function getRugById(id: string): Promise<Rug | null> {
  return source.getRugById(id);
}

export async function searchRugs(
  query: string,
  filters?: RugSearchFilters,
  limit?: number,
): Promise<Rug[]> {
  return source.searchRugs(query, filters, limit);
}

export async function findSimilar(rugId: string, limit = 4): Promise<Rug[]> {
  return source.findSimilar(rugId, limit);
}

export async function listCollections() {
  return source.listCollections();
}
