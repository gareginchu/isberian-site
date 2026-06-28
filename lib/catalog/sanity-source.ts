import type { Rug, RugOrigin, RugDescription } from "@/lib/types/rug";
import type { CatalogSource } from "./source";
import type { RugSearchFilters } from "./types";
import { sanity } from "@/lib/sanity/client";
import { similarRugIds } from "@/lib/similarity/visual";

/**
 * Sanity-backed catalog source. Queries `rug` and `collection` documents via
 * GROQ; maps each document into the same `Rug` shape the FixtureCatalogSource
 * returns so /app, /lib/search, and /lib/ai never know which is wired in.
 *
 * Activated by setting `CATALOG_SOURCE=sanity` plus the three Sanity env vars
 * (NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN).
 * If any of those are missing, callers should see a noisy fallback rather than
 * a silent empty catalog — handled at the seam in lib/catalog/index.ts.
 */

// GROQ projection — pull every field a rug PDP or grid needs in one query.
const RUG_PROJECTION = `{
  _id, _updatedAt, title, "slug": slug.current, status, collection,
  description, images, draft,
  model3dGlbUrl, model3dUsdzUrl, viewer3dUrl, viewer3dQrUrl,
  suggestedRoomUrl, lifestyle
}`;

const ALL_RUGS_QUERY = `*[_type == "rug" && !(_id in path("drafts.**"))] ${RUG_PROJECTION}`;
const ONE_RUG_BY_SLUG = `*[_type == "rug" && slug.current == $slug && !(_id in path("drafts.**"))][0] ${RUG_PROJECTION}`;
const ONE_RUG_BY_ID = `*[_type == "rug" && _id == $id && !(_id in path("drafts.**"))][0] ${RUG_PROJECTION}`;
const COLLECTIONS_QUERY = `*[_type == "collection" && !(_id in path("drafts.**"))]{ "slug": slug.current, title }`;

type SanityRugDoc = {
  _id: string;
  _updatedAt: string;
  title: string;
  slug: string;
  status?: "available" | "on-memo" | "sold" | "draft";
  collection?: { _ref?: string } | string;
  description: RugDescription;
  images: { src: string; alt: string; primary?: boolean }[];
  draft?: boolean;
  model3dGlbUrl?: string;
  model3dUsdzUrl?: string;
  viewer3dUrl?: string;
  viewer3dQrUrl?: string;
  suggestedRoomUrl?: string;
  lifestyle?: { slug: string; label: string; src: string }[];
};

function shortIdFromDocId(docId: string): string {
  // Documents are stored as `rug.<seedId>` — the public Rug.id is `rug-<seedId>`.
  return docId.replace(/^rug\./, "rug-");
}

function toRug(doc: SanityRugDoc): Rug {
  const collection = typeof doc.collection === "string" ? doc.collection : doc.collection?._ref;
  return {
    id: shortIdFromDocId(doc._id),
    slug: doc.slug,
    title: doc.title,
    status: doc.status ?? "available",
    collection: collection ?? "antique-persian",
    description: doc.description,
    images: doc.images ?? [],
    ...(doc.viewer3dUrl ? { viewer3dUrl: doc.viewer3dUrl } : {}),
    ...(doc.viewer3dQrUrl ? { viewer3dQrUrl: doc.viewer3dQrUrl } : {}),
    ...(doc.model3dGlbUrl ? { model3dGlbUrl: doc.model3dGlbUrl } : {}),
    ...(doc.model3dUsdzUrl ? { model3dUsdzUrl: doc.model3dUsdzUrl } : {}),
    ...(doc.suggestedRoomUrl ? { suggestedRoomUrl: doc.suggestedRoomUrl } : {}),
    ...(doc.lifestyle && doc.lifestyle.length > 0 ? { lifestyle: doc.lifestyle } : {}),
    updatedAt: doc._updatedAt,
    draft: doc.draft === true,
  };
}

function scoreByMetadata(src: Rug, pool: Rug[]): Rug[] {
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
  return scored.map((s) => s.r);
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "for", "with", "in", "on", "to", "is", "are",
  "my", "our", "we", "i", "you", "your", "have", "has", "rug", "rugs",
]);

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function scoreRug(rug: Rug, terms: string[]): number {
  if (terms.length === 0) return 0;
  const haystack = [
    rug.title, rug.description.lead,
    rug.description.designFeatures.join(" "),
    rug.description.distinguishing.join(" "),
    rug.description.colorPalette.map((c) => c.name).join(" "),
    rug.description.provenance.origin,
    rug.description.provenance.region ?? "",
    rug.description.details.materials.join(" "),
    rug.description.details.technique,
  ].join(" ").toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (haystack.includes(t)) score += 2;
    else if (haystack.split(/\s+/).some((w) => w.startsWith(t))) score += 1;
  }
  return score;
}

function passesFilters(rug: Rug, filters?: RugSearchFilters): boolean {
  if (!filters) return true;
  if (filters.origin?.length && !filters.origin.includes(rug.description.provenance.origin as RugOrigin)) return false;
  if (filters.technique?.length && !filters.technique.includes(rug.description.details.technique)) return false;
  if (filters.status?.length && !filters.status.includes(rug.status)) return false;
  if (filters.materials?.length) {
    const mats = rug.description.details.materials;
    if (!filters.materials.some((m) => mats.includes(m))) return false;
  }
  return true;
}

export class SanityCatalogSource implements CatalogSource {
  private cache: { rugs: Rug[]; at: number } | null = null;
  private CACHE_MS = 30_000; // 30s — cheap-enough invalidation for editorial changes

  private async fetchAll(): Promise<Rug[]> {
    if (this.cache && Date.now() - this.cache.at < this.CACHE_MS) return this.cache.rugs;
    const client = sanity();
    if (!client) throw new Error("Sanity client not configured (missing NEXT_PUBLIC_SANITY_PROJECT_ID)");
    const docs = await client.fetch<SanityRugDoc[]>(ALL_RUGS_QUERY);
    const rugs = docs.map(toRug).filter((r) => !r.draft);
    this.cache = { rugs, at: Date.now() };
    return rugs;
  }

  async listRugs(): Promise<Rug[]> {
    return this.fetchAll();
  }

  async getRug(slug: string): Promise<Rug | null> {
    const client = sanity();
    if (!client) return null;
    const doc = await client.fetch<SanityRugDoc | null>(ONE_RUG_BY_SLUG, { slug });
    if (!doc) return null;
    const r = toRug(doc);
    return r.draft ? null : r;
  }

  async getRugById(id: string): Promise<Rug | null> {
    // Public id is `rug-<seedId>` but Sanity stores it as `rug.<seedId>`.
    const docId = id.replace(/^rug-/, "rug.");
    const client = sanity();
    if (!client) return null;
    const doc = await client.fetch<SanityRugDoc | null>(ONE_RUG_BY_ID, { id: docId });
    if (!doc) return null;
    const r = toRug(doc);
    return r.draft ? null : r;
  }

  async listCollections() {
    const client = sanity();
    if (!client) return [];
    return client.fetch<{ slug: string; title: string }[]>(COLLECTIONS_QUERY);
  }

  async findSimilar(rugId: string, limit = 4): Promise<Rug[]> {
    const src = await this.getRugById(rugId);
    if (!src) return [];
    const all = await this.listRugs();
    const byId = new Map(all.map((r) => [r.id, r]));

    // Primary: CLIP visual embeddings (precomputed offline, independent of source).
    const visualIds = similarRugIds(rugId, limit);
    if (visualIds.length > 0) {
      const visual = visualIds.map((id) => byId.get(id)).filter((r): r is Rug => Boolean(r));
      if (visual.length >= limit) return visual.slice(0, limit);
      const seen = new Set(visual.map((r) => r.id));
      const fallback = scoreByMetadata(src, all.filter((r) => r.id !== rugId && !seen.has(r.id)));
      return [...visual, ...fallback.slice(0, limit - visual.length)];
    }
    return scoreByMetadata(src, all.filter((r) => r.id !== rugId)).slice(0, limit);
  }

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
