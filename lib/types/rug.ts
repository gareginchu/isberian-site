// The catalog's truth. Never publish prices. Never expose upstream quirks.

export type RugStatus = "available" | "on-memo" | "sold" | "draft";

export type RugOrigin =
  | "Persian"
  | "Turkish"
  | "Caucasian"
  | "Indian"
  | "Tibetan"
  | "Moroccan"
  | "Scandinavian"
  | "Contemporary"
  | "Unspecified";

export type RugTechnique =
  | "Hand-knotted"
  | "Hand-woven (flatweave)"
  | "Hand-tufted"
  | "Hand-loomed";

export type RugMaterial = "Wool" | "Silk" | "Wool & silk" | "Cotton" | "Linen" | "Hemp" | "Jute";

export type ColorChip = {
  name: string; // editorial name: "madder red", "indigo", "undyed ivory"
  hex: string;
  weight: "primary" | "secondary" | "accent";
};

/**
 * The structured description block. Every rug page renders these fields, not a free prose blob.
 * AI drafts each field from attributes + images; an editor verifies before publish. Any unverified
 * origin/age/knot-count/provenance claim must stay `verified: false` and is visibly flagged.
 *
 * Voice rules (see /lib/ai/prompts/voice.ts): specific and restrained; no empty superlatives
 * ("Exquisite ... Masterpiece ..."). Specificity sells this category — adjectives don't.
 */
export type RugDescription = {
  /** ≤ 240 chars. The headline reading. Concrete, no marketing varnish. */
  lead: string;
  /** Bulleted facts — size, technique, materials, pile, knot density if verified. */
  details: {
    sizeImperial: string; // e.g. '9'2" × 12'4"'
    sizeMetric: string; // e.g. '2.79 × 3.76 m'
    technique: RugTechnique;
    materials: RugMaterial[];
    pile: "Low" | "Medium" | "High";
    knotDensity?: { knotsPerSqIn: number; verified: boolean };
    age?: { circa: string; verified: boolean }; // "c. 1890" or "Mid-20th century"
    condition?: string; // "Excellent, full pile, original ends and selvages."
  };
  colorPalette: ColorChip[];
  designFeatures: string[]; // ["all-over Herati", "ivory field", "rosette spandrels"]
  distinguishing: string[]; // genuinely uncommon notes worth elevating
  provenance: {
    origin: RugOrigin;
    region?: string; // "Tabriz", "Heriz", "Konya"
    weaver?: string;
    verified: boolean; // editor must confirm
    note?: string;
  };
};

export type Rug = {
  id: string;
  slug: string;
  title: string;
  status: RugStatus;
  collection?: string; // slug ref
  description: RugDescription;
  images: { src: string; alt: string; primary?: boolean }[];
  // Embedding vectors are stored server-side; never sent to the client.
  embeddingId?: string;
  /** External 3D / AR viewer URL (e.g. Carpetify). Renders a "View in 3D"
   * button on the rug detail page that opens an iframe modal. Omit for rugs
   * without a 3D model yet. */
  viewer3dUrl?: string;
  /** Path (relative to /public) of a QR code image. When set, the rug detail
   * page shows the QR + caption — phone scans bypass the iframe-embed and
   * load the AR view directly on the visitor's phone. Preferred over
   * viewer3dUrl when the provider blocks iframe embedding. */
  viewer3dQrUrl?: string;
  updatedAt: string; // ISO
  draft: boolean; // until editor approves
};

// Facets surfaced in /rugs grid + concierge filtering.
export type RugFacets = {
  origin?: RugOrigin[];
  technique?: RugTechnique[];
  materials?: RugMaterial[];
  sizeBand?: ("Scatter" | "Accent" | "Room" | "Oversize")[];
  colorFamily?: string[]; // "red", "blue", "ivory", "earth", "green", "dark"
  status?: RugStatus[];
};
