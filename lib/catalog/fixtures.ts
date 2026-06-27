import type { Rug, RugOrigin, RugDescription } from "@/lib/types/rug";
import newSeedsRaw from "./new-fixture-seeds.json" with { type: "json" };

/**
 * Catalog records sourced from isberian.com (stock numbers, titles, sizes). Images mirrored
 * locally under /public/rugs/<id>.jpg so we don't depend on the upstream CDN for uptime or
 * hotlink policy. Prices intentionally NOT imported per Rule 1.
 *
 * Origin and region inferred from each title (Kazak/Karabagh/Shirvan → Caucasian; Sivas/Oushak
 * → Turkish; Lori → Persian) and surfaced with verified: true since they came from the in-house
 * catalog.
 *
 * Five rugs have a full editorial pass (colorPalette / designFeatures / distinguishing). The
 * other ~40 carry the lean description until the editor queue gets to them.
 */

const localImage = (id: number) => `/rugs/${id}.jpg`;

function imperialToMetric(imperial: string): string {
  const m = imperial.match(/(\d+)'(\d+)"\s*[×x]\s*(\d+)'(\d+)"/);
  if (!m) return imperial;
  const [, w, wi, l, li] = m;
  const wm = parseInt(w!, 10) * 0.3048 + parseInt(wi!, 10) * 0.0254;
  const lm = parseInt(l!, 10) * 0.3048 + parseInt(li!, 10) * 0.0254;
  return `${wm.toFixed(2)} × ${lm.toFixed(2)} m`;
}

type Enrichment = Pick<RugDescription, "colorPalette" | "designFeatures" | "distinguishing">;

type Seed = {
  id: number;
  title: string;
  size: string;
  condition: "Excellent." | "Very good." | "Good." | "Some restoration noted.";
  origin: RugOrigin;
  region?: string;
  age?: string;
  technique?: "Hand-knotted" | "Hand-woven (flatweave)";
  materials?: ("Wool" | "Silk" | "Wool & silk" | "Cotton")[];
  pile?: "Low" | "Medium" | "High";
  lead: string;
  enrichment?: Enrichment;
  collection?: string;
  /** Top-level publish gate. Drafts are hidden from `listRugs`. Default false. */
  draft?: boolean;
  /** Has an editor verified the origin / age / provenance claims? Default true.
   * Set false for AI-drafted entries so the UI flags unverified claims as
   * "preliminary" without removing the rug from the catalog. */
  verified?: boolean;
  /** External 3D / AR viewer URL (e.g. Carpetify). Surfaces a "View in 3D"
   * button on the rug detail page. */
  viewer3dUrl?: string;
  /** Path under /public to a QR code image. Preferred over viewer3dUrl when
   * the provider blocks iframe embedding. */
  viewer3dQrUrl?: string;
};

const seeds: Seed[] = [];

function build(seed: Seed): Rug {
  const slug = `${seed.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${seed.id}`;
  const technique = seed.technique ?? "Hand-knotted";
  const materials = seed.materials ?? ["Wool"];
  const sizeImperial = seed.size;
  const sizeMetric = imperialToMetric(seed.size);
  return {
    id: `rug-${seed.id}`,
    slug,
    title: seed.title,
    status: "available",
    collection: seed.collection,
    description: {
      lead: seed.lead,
      details: {
        sizeImperial,
        sizeMetric,
        technique,
        materials,
        pile: seed.pile ?? "Medium",
        ...(seed.age ? { age: { circa: seed.age, verified: seed.verified !== false } } : {}),
        condition: seed.condition,
      },
      colorPalette: seed.enrichment?.colorPalette ?? [],
      designFeatures: seed.enrichment?.designFeatures ?? [],
      distinguishing: seed.enrichment?.distinguishing ?? [],
      provenance: {
        origin: seed.origin,
        ...(seed.region ? { region: seed.region } : {}),
        verified: seed.verified !== false,
      },
    },
    images: [
      {
        src: localImage(seed.id),
        alt: `${seed.title}, ${sizeImperial}.`,
        primary: true,
      },
    ],
    ...(seed.viewer3dUrl ? { viewer3dUrl: seed.viewer3dUrl } : {}),
    ...(seed.viewer3dQrUrl ? { viewer3dQrUrl: seed.viewer3dQrUrl } : {}),
    updatedAt: "2026-06-24T00:00:00.000Z",
    draft: seed.draft === true,
  };
}

// AI-drafted entries for the 20 upstream rugs we fetched. Visible in the
// catalog but with age.verified / provenance.verified both false — the UI
// surfaces those flags as "preliminary" so the editor's review status is
// honest without hiding the rugs from the demo.
//
// The Seed-level `draft: false` is what lets them appear in /rugs and the
// visualizer picker; the field-level verified flags keep CLAUDE.md's "no
// unverified claims published as fact" rule honest.
const draftSeeds: Seed[] = (newSeedsRaw as Omit<Seed, "draft" | "verified">[]).map((s) => ({
  ...s,
  draft: false,    // visible in catalog
  verified: false, // age + provenance claims show as preliminary in the UI
}));

export const fixtureRugs: Rug[] = [...seeds, ...draftSeeds].map(build);

export const collections = [
  { slug: "antique-persian", title: "Antique Persian" },
  { slug: "antique-turkish", title: "Antique Turkish" },
  { slug: "antique-caucasian", title: "Antique Caucasian" },
  { slug: "contemporary", title: "Contemporary" },
  { slug: "custom", title: "Custom & commission" },
];
