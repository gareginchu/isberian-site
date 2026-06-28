/**
 * Tiny read/write layer for the curator backdoor. Operates directly on
 * lib/catalog/new-fixture-seeds.json — the same file the fixture catalog
 * source reads. Edits land immediately in dev; on Vercel, writes go to
 * /tmp and won't persist between cold starts (the file system there is
 * effectively read-only). The curator UI surfaces this caveat with an
 * export button so the editor can copy the updated JSON to their laptop.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SEEDS_PATH = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");

/** Shape of a seed entry in new-fixture-seeds.json — kept loose so the curator
 *  can edit fields the catalog doesn't currently render. */
export type Seed = {
  id: number;
  title: string;
  size: string;
  condition: string;
  origin: string;
  region?: string;
  age: string;
  technique: string;
  materials: string[];
  pile: string;
  lead: string;
  enrichment: {
    colorPalette: { name: string; hex: string; weight: "primary" | "secondary" | "accent" }[];
    designFeatures: string[];
    distinguishing: string[];
  };
  collection: string;
  draft: boolean;
  // Pass-through asset fields — curator never edits these but they must be preserved
  model3dGlbUrl?: string;
  model3dUsdzUrl?: string;
  suggestedRoomUrl?: string;
  lifestyle?: { slug: string; label: string; src: string }[];
  viewer3dUrl?: string;
  viewer3dQrUrl?: string;
};

export async function listSeeds(): Promise<Seed[]> {
  const raw = await readFile(SEEDS_PATH, "utf8");
  return JSON.parse(raw);
}

export async function getSeed(id: number): Promise<Seed | null> {
  const seeds = await listSeeds();
  return seeds.find((s) => s.id === id) ?? null;
}

/** Slug derived from title + id. Must stay byte-identical to the catalog's
 *  build() in lib/catalog/fixtures.ts so /curator/[slug] and /rugs/[slug]
 *  resolve to the same rug. */
export function slugFor(seed: Seed): string {
  const base = seed.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${seed.id}`;
}

export async function saveSeed(id: number, patch: Partial<Seed>): Promise<{ ok: boolean; tmp?: boolean }> {
  const seeds = await listSeeds();
  const idx = seeds.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error(`seed ${id} not found`);
  // Never let the curator overwrite the SKU.
  const { id: _ignoredId, ...safePatch } = patch;
  seeds[idx] = { ...seeds[idx], ...safePatch };
  const json = JSON.stringify(seeds, null, 2);
  try {
    await writeFile(SEEDS_PATH, json);
    return { ok: true };
  } catch (e) {
    // On Vercel, lib/ is read-only at runtime — fall back to /tmp so the
    // session sees the edit but it won't survive a cold start. The UI shows
    // an Export button so the editor can commit by hand.
    if (process.env.VERCEL) {
      const tmpPath = path.join("/tmp", "new-fixture-seeds.json");
      await writeFile(tmpPath, json);
      return { ok: true, tmp: true };
    }
    throw e;
  }
}

/** Same JSON the curator would commit. Used by the Export button. */
export async function exportSeedsJson(): Promise<string> {
  const seeds = await listSeeds();
  return JSON.stringify(seeds, null, 2);
}
