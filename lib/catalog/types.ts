/**
 * Catalog data contract — the source of truth for the Rug shape used across the app.
 *
 * Per CLAUDE.md → "Inventory feed — the critical dependency": "The data contract lives in
 * /lib/catalog/types.ts and is the source of truth." This file is a thin aggregator over the
 * existing canonical type at /lib/types/rug.ts so we have one import path for catalog consumers
 * (`@/lib/catalog/types`) without churning every existing call site that already imports from
 * `@/lib/types/rug`. Both paths resolve to the same types — no parallel definitions.
 *
 * When the dedicated Postgres catalog DB lands, the row-to-domain mapper in PostgresCatalogSource
 * projects rows into this shape; nothing downstream changes.
 */

export type {
  Rug,
  RugDescription,
  RugStatus,
  RugOrigin,
  RugTechnique,
  RugMaterial,
  RugFacets,
  ColorChip,
} from "@/lib/types/rug";

import type { RugFacets } from "@/lib/types/rug";

/**
 * Search filter contract passed to `CatalogSource.searchRugs`. Currently a re-naming of
 * `RugFacets` so search filters and grid facets share one shape — divergence here is a smell.
 */
export type RugSearchFilters = RugFacets;
