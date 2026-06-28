/**
 * Read/write layer for the curator backdoor — backed by Sanity.
 *
 * The curator UI sees a flat `Seed` shape (legacy of the JSON-file days);
 * Sanity stores rugs in a nested `rug` document shape that mirrors the
 * Studio schema. This module is the translation seam: GROQ in, patches out,
 * Seed shape exposed to the EditForm and the index page.
 *
 * Note: writes go to the live Sanity dataset and the public site reads from
 * the same dataset, with the SanityCatalogSource's 30s in-memory cache in
 * between. After a save, the curator may see the public PDP take up to 30s
 * to reflect the change. This is intentional — the cache absorbs read load.
 */
import { sanity } from "@/lib/sanity/client";

/** Flat shape the curator UI knows about — title, size, prose, palette, etc.
 *  Asset fields (3D, AR, lifestyle) are read-through so they survive save
 *  round-trips even though the form doesn't expose them as editable. */
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
  model3dGlbUrl?: string;
  model3dUsdzUrl?: string;
  suggestedRoomUrl?: string;
  lifestyle?: { slug: string; label: string; src: string }[];
  viewer3dUrl?: string;
  viewer3dQrUrl?: string;
};

// GROQ projection — every field the curator UI needs from one rug doc.
const RUG_PROJECTION = `{
  _id, title, "slug": slug.current,
  "collection": collection, draft,
  "size": description.details.sizeImperial,
  "condition": description.details.condition,
  "origin": description.provenance.origin,
  "region": description.provenance.region,
  "age": description.details.age.circa,
  "technique": description.details.technique,
  "materials": description.details.materials,
  "pile": description.details.pile,
  "lead": description.lead,
  "colorPalette": description.colorPalette,
  "designFeatures": description.designFeatures,
  "distinguishing": description.distinguishing,
  model3dGlbUrl, model3dUsdzUrl, suggestedRoomUrl, lifestyle,
  viewer3dUrl, viewer3dQrUrl
}`;

type SanityRugProjection = {
  _id: string;
  title: string;
  slug?: string;
  collection?: string | { _ref?: string };
  draft?: boolean;
  size?: string;
  condition?: string;
  origin?: string;
  region?: string;
  age?: string;
  technique?: string;
  materials?: string[];
  pile?: string;
  lead?: string;
  colorPalette?: Seed["enrichment"]["colorPalette"];
  designFeatures?: string[];
  distinguishing?: string[];
  model3dGlbUrl?: string;
  model3dUsdzUrl?: string;
  suggestedRoomUrl?: string;
  lifestyle?: Seed["lifestyle"];
  viewer3dUrl?: string;
  viewer3dQrUrl?: string;
};

function docToSeed(doc: SanityRugProjection): Seed {
  const id = parseInt(doc._id.replace(/^rug\./, ""), 10);
  const collection = typeof doc.collection === "string" ? doc.collection : doc.collection?._ref ?? "antique-persian";
  return {
    id,
    title: doc.title,
    size: doc.size ?? "",
    condition: doc.condition ?? "Good.",
    origin: doc.origin ?? "Persian",
    region: doc.region,
    age: doc.age ?? "",
    technique: doc.technique ?? "Hand-knotted",
    materials: doc.materials ?? ["Wool"],
    pile: doc.pile ?? "Medium",
    lead: doc.lead ?? "",
    enrichment: {
      colorPalette: doc.colorPalette ?? [],
      designFeatures: doc.designFeatures ?? [],
      distinguishing: doc.distinguishing ?? [],
    },
    collection,
    draft: doc.draft === true,
    ...(doc.model3dGlbUrl ? { model3dGlbUrl: doc.model3dGlbUrl } : {}),
    ...(doc.model3dUsdzUrl ? { model3dUsdzUrl: doc.model3dUsdzUrl } : {}),
    ...(doc.suggestedRoomUrl ? { suggestedRoomUrl: doc.suggestedRoomUrl } : {}),
    ...(doc.lifestyle && doc.lifestyle.length > 0 ? { lifestyle: doc.lifestyle } : {}),
    ...(doc.viewer3dUrl ? { viewer3dUrl: doc.viewer3dUrl } : {}),
    ...(doc.viewer3dQrUrl ? { viewer3dQrUrl: doc.viewer3dQrUrl } : {}),
  };
}

function requireSanity() {
  const client = sanity();
  if (!client) {
    throw new Error(
      "Sanity not configured — set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_TOKEN in .env.local.",
    );
  }
  return client;
}

export async function listSeeds(): Promise<Seed[]> {
  const client = requireSanity();
  const docs = await client.fetch<SanityRugProjection[]>(
    `*[_type == "rug" && !(_id in path("drafts.**"))] | order(_id asc) ${RUG_PROJECTION}`,
  );
  return docs.map(docToSeed);
}

export async function getSeed(id: number): Promise<Seed | null> {
  const client = requireSanity();
  const doc = await client.fetch<SanityRugProjection | null>(
    `*[_type == "rug" && _id == $id && !(_id in path("drafts.**"))][0] ${RUG_PROJECTION}`,
    { id: `rug.${id}` },
  );
  return doc ? docToSeed(doc) : null;
}

/** Slug derived from title + id. Must stay byte-identical to the catalog's
 *  build() in lib/catalog/fixtures.ts so /curator/[slug] and /rugs/[slug]
 *  resolve to the same rug. */
export function slugFor(seed: Seed): string {
  const base = seed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base}-${seed.id}`;
}

/** Translate a flat Seed patch into the dotted-path set operations Sanity's
 *  patch API expects. Fields the curator didn't change are left untouched. */
function patchOps(patch: Partial<Seed>): Record<string, unknown> {
  const ops: Record<string, unknown> = {};
  if (patch.title !== undefined) ops["title"] = patch.title;
  if (patch.collection !== undefined) ops["collection"] = patch.collection;
  if (patch.draft !== undefined) ops["draft"] = patch.draft;
  if (patch.lead !== undefined) ops["description.lead"] = patch.lead;
  if (patch.size !== undefined) ops["description.details.sizeImperial"] = patch.size;
  if (patch.condition !== undefined) ops["description.details.condition"] = patch.condition;
  if (patch.technique !== undefined) ops["description.details.technique"] = patch.technique;
  if (patch.materials !== undefined) ops["description.details.materials"] = patch.materials;
  if (patch.pile !== undefined) ops["description.details.pile"] = patch.pile;
  if (patch.age !== undefined) ops["description.details.age.circa"] = patch.age;
  if (patch.origin !== undefined) ops["description.provenance.origin"] = patch.origin;
  if (patch.region !== undefined) ops["description.provenance.region"] = patch.region;
  if (patch.enrichment?.colorPalette !== undefined) ops["description.colorPalette"] = patch.enrichment.colorPalette;
  if (patch.enrichment?.designFeatures !== undefined) ops["description.designFeatures"] = patch.enrichment.designFeatures;
  if (patch.enrichment?.distinguishing !== undefined) ops["description.distinguishing"] = patch.enrichment.distinguishing;
  return ops;
}

export async function saveSeed(id: number, patch: Partial<Seed>): Promise<{ ok: boolean }> {
  const client = requireSanity();
  // SKU is never editable.
  const { id: _ignoredId, ...safePatch } = patch;
  const ops = patchOps(safePatch);
  if (Object.keys(ops).length === 0) return { ok: true };
  await client.patch(`rug.${id}`).set(ops).commit();
  return { ok: true };
}

/** Full catalog snapshot, in the same JSON shape the original seed file used.
 *  Useful as a manual backup the curator can download anytime. */
export async function exportSeedsJson(): Promise<string> {
  const seeds = await listSeeds();
  return JSON.stringify(seeds, null, 2);
}
