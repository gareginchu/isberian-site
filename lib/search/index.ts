import type { Rug, RugFacets } from "@/lib/types/rug";
import { listRugs } from "@/lib/catalog";

/**
 * Hybrid semantic + facet search stub. Production wiring uses pgvector for the semantic side and
 * SQL filters for the facet side, intersected and re-ranked. Here we approximate with a simple
 * token-overlap + boost-on-attributes scorer so the surface above (concierge tool, grid, facets)
 * has a real interface to call against.
 *
 * Public contract:
 * - searchInventory(query, filters?, limit?) → at most `limit` real Rug records, never invented.
 * - filterRugs(rugs, facets) → faceted subset, used by /rugs grid.
 */

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
  if (terms.length === 0) return 1;
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
    // partial: t is a substring of any tokenized word
    else if (haystack.split(/\s+/).some((w) => w.startsWith(t))) score += 1;
  }
  return score;
}

function passesFilters(rug: Rug, filters?: Record<string, unknown>): boolean {
  if (!filters) return true;
  const f = filters as Partial<{
    origin: string[];
    colorFamily: string[];
    sizeBand: string[];
    technique: string[];
    materials: string[];
    status: string[];
  }>;
  if (f.origin?.length && !f.origin.includes(rug.description.provenance.origin)) return false;
  if (f.technique?.length && !f.technique.includes(rug.description.details.technique)) return false;
  if (f.status?.length && !f.status.includes(rug.status)) return false;
  if (f.colorFamily?.length) {
    const fam = rug.description.colorPalette.map((c) => colorFamilyOf(c.name));
    if (!f.colorFamily.some((c) => fam.includes(c))) return false;
  }
  if (f.sizeBand?.length && !f.sizeBand.includes(sizeBandOf(rug))) return false;
  if (f.materials?.length) {
    const mats = rug.description.details.materials;
    if (!f.materials.some((m) => mats.includes(m as (typeof mats)[number]))) return false;
  }
  return true;
}

export function colorFamilyOf(name: string): string {
  const n = name.toLowerCase();
  if (/red|coral|madder|rose|crimson|oxblood/.test(n)) return "red";
  if (/blue|indigo|sapphire|navy|midnight/.test(n)) return "blue";
  if (/ivory|cream|undyed|warm/.test(n)) return "ivory";
  if (/green|sage|olive/.test(n)) return "green";
  if (/yellow|ochre|imperial/.test(n)) return "earth";
  if (/charcoal|black|deep/.test(n)) return "dark";
  if (/saddle|brown|tan/.test(n)) return "earth";
  return "neutral";
}

export function sizeBandOf(rug: Rug): "Scatter" | "Accent" | "Room" | "Oversize" {
  // Crude band from imperial size string.
  const m = rug.description.details.sizeImperial.match(/(\d+)'\s*(\d*)\D+(\d+)'/);
  if (!m) return "Accent";
  const w = parseInt(m[1] ?? "0", 10);
  const l = parseInt(m[3] ?? "0", 10);
  const area = w * l;
  if (area < 25) return "Scatter";
  if (area < 70) return "Accent";
  if (area < 140) return "Room";
  return "Oversize";
}

export async function searchInventory(
  query: string,
  filters?: Record<string, unknown>,
  limit = 6,
): Promise<Rug[]> {
  const all = await listRugs();
  const terms = tokenize(query);
  const scored = all
    .filter((r) => passesFilters(r, filters))
    .map((r) => ({ r, score: scoreRug(r, terms) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.min(limit, 8)).map((s) => s.r);
}

export function filterRugs(rugs: Rug[], facets: RugFacets): Rug[] {
  return rugs.filter((r) => {
    if (facets.origin?.length && !facets.origin.includes(r.description.provenance.origin)) return false;
    if (facets.technique?.length && !facets.technique.includes(r.description.details.technique)) return false;
    if (facets.status?.length && !facets.status.includes(r.status)) return false;
    if (facets.materials?.length) {
      const mats = r.description.details.materials;
      if (!facets.materials.some((m) => mats.includes(m))) return false;
    }
    if (facets.sizeBand?.length && !facets.sizeBand.includes(sizeBandOf(r))) return false;
    if (facets.colorFamily?.length) {
      const fam = r.description.colorPalette.map((c) => colorFamilyOf(c.name));
      if (!facets.colorFamily.some((c) => fam.includes(c))) return false;
    }
    return true;
  });
}
