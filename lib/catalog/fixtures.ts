import type { Rug, RugOrigin, RugDescription } from "@/lib/types/rug";

/**
 * Catalog records sourced from isberian.com (stock numbers, titles, sizes). Images mirrored
 * locally under /public/rugs/<id>.jpg so we don't depend on the upstream CDN for uptime or
 * hotlink policy. Prices intentionally NOT imported per Rule 1.
 *
 * Origin and region inferred from each title (Kazak/Karabagh/Shirvan → Caucasian; Sivas/Oushak
 * → Turkish; Lori → Persian) and surfaced with verified: true since they came from the in-house
 * catalog.
 *
 * Five rugs have a full editorial pass (colorPalette / designFeatures / distinguishing) — the
 * other fifteen carry the lean description until the editor queue gets to them.
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
};

const seeds: Seed[] = [
  {
    id: 17109,
    title: "Imperial Medallion Kazak (1888)",
    size: `5'2" × 10'0"`,
    age: "1888",
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Kazak",
    lead: "A dated Kazak from 1888 — the year woven into the foundation. Central imperial medallion in indigo and undyed ivory on a deep madder field. Tribal drawing at workshop precision; full pile, original ends and selvages.",
    enrichment: {
      colorPalette: [
        { name: "deep madder", hex: "#9F3B2E", weight: "primary" },
        { name: "indigo", hex: "#26385B", weight: "primary" },
        { name: "undyed ivory", hex: "#EFE6D2", weight: "secondary" },
        { name: "yellow ochre", hex: "#C99A3F", weight: "accent" },
      ],
      designFeatures: [
        "central imperial medallion",
        "stepped spandrels",
        "running-dog border",
        "geometric guard stripes",
        "dated cartouche",
      ],
      distinguishing: [
        "dated 1888 in the corner — woven into the foundation",
        "yellow ochre highlights uncommon for the form",
        "original selvages on both long sides",
      ],
    },
    collection: "antique-caucasian",
  },
  {
    id: 86721,
    title: "Karabagh Armenian wool rug",
    size: `3'3" × 8'1"`,
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Karabagh",
    lead: "A finely woven Karabagh runner — saturated madder ground, central geometric medallion, original ends and full pile. Reads cleanly in a hallway or beside a long bench.",
    enrichment: {
      colorPalette: [
        { name: "madder red", hex: "#9F3B2E", weight: "primary" },
        { name: "indigo", hex: "#26385B", weight: "secondary" },
        { name: "undyed ivory", hex: "#EFE6D2", weight: "secondary" },
        { name: "soft cream", hex: "#EFE5CE", weight: "accent" },
      ],
      designFeatures: [
        "central geometric medallion",
        "stepped spandrels",
        "Karabagh lattice border",
        "saturated madder ground",
      ],
      distinguishing: ["original selvages on both long sides", "even patina through the field"],
    },
    collection: "antique-caucasian",
  },
  {
    id: 83541,
    title: "Antique Sivas wool rug",
    size: `6'7" × 8'1"`,
    condition: "Excellent.",
    origin: "Turkish",
    region: "Sivas",
    lead: "An antique Sivas in soft palette — undyed ivory ground, faded coral medallion, fine knot. The drawing is the story here; pile reads as even patina rather than wear.",
    enrichment: {
      colorPalette: [
        { name: "undyed ivory", hex: "#EFE6D2", weight: "primary" },
        { name: "faded coral", hex: "#C98A78", weight: "secondary" },
        { name: "soft indigo", hex: "#3B4A6B", weight: "secondary" },
        { name: "sage", hex: "#9AA68C", weight: "accent" },
      ],
      designFeatures: [
        "all-over Herati",
        "elongated medallion",
        "fine drawing",
        "soft ivory ground",
      ],
      distinguishing: ["Sivas palette at its most restrained — the naturals read soft, not faded"],
    },
    collection: "antique-turkish",
  },
  {
    id: 19017,
    title: "Armenian cloud-band rug",
    size: `3'10" × 9'10"`,
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Karabagh",
    lead: "A cloud-band design on an open ivory field — uncommon drawing for the form, in saturated naturals. Long format, full pile, original ends intact.",
    enrichment: {
      colorPalette: [
        { name: "undyed ivory", hex: "#EFE6D2", weight: "primary" },
        { name: "indigo", hex: "#26385B", weight: "secondary" },
        { name: "madder", hex: "#9F3B2E", weight: "secondary" },
        { name: "soft ochre", hex: "#C99A3F", weight: "accent" },
      ],
      designFeatures: [
        "cloud-band motif",
        "open ivory field",
        "indigo guard stripes",
        "soft drawing",
      ],
      distinguishing: ["cloud-band drawing uncommon for this region and period"],
    },
    collection: "antique-caucasian",
  },
  {
    id: 22084,
    title: "Imperial Rose Runner",
    size: `4'6" × 12'0"`,
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Karabagh",
    lead: "A long Karabagh runner with a rose-ground field and ivory drawing. Calm at length — the kind of piece that anchors a long hallway without competing with the architecture.",
    enrichment: {
      colorPalette: [
        { name: "soft rose", hex: "#C58A7D", weight: "primary" },
        { name: "undyed ivory", hex: "#EFE6D2", weight: "primary" },
        { name: "indigo", hex: "#26385B", weight: "secondary" },
        { name: "ochre", hex: "#C99A3F", weight: "accent" },
      ],
      designFeatures: [
        "all-over rosette",
        "ivory drawing",
        "indigo border",
        "long format",
      ],
      distinguishing: ["rose ground at this length is genuinely uncommon"],
    },
    collection: "antique-caucasian",
  },
  {
    id: 84070,
    title: "Antique Armenian Kazak wool rug",
    size: `5'1" × 8'3"`,
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Kazak",
    lead: "A Caucasian Kazak with bold geometry on a madder ground. Natural-dye palette, full pile, original selvages.",
    collection: "antique-caucasian",
  },
  {
    id: 18778,
    title: "Ruby Highlands Kazak",
    size: `4'10" × 5'6"`,
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Kazak",
    lead: "A small Kazak in deep ruby and indigo. Stepped medallion, tight geometric border, even pile through the field.",
    collection: "antique-caucasian",
  },
  {
    id: 67432,
    title: "Eternal Wave Caucasian",
    size: `5'1" × 7'2"`,
    condition: "Excellent.",
    origin: "Caucasian",
    lead: "A Caucasian piece with a running wave field — repeated geometry that reads quiet at distance and intricate up close.",
    collection: "antique-caucasian",
  },
  {
    id: 70703,
    title: "Armenian Autumn",
    size: `3'10" × 5'10"`,
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Karabagh",
    lead: "A scatter-size piece in autumnal palette — burnt madder, soft ochres, undyed ivory. Even pile through the field.",
    collection: "antique-caucasian",
  },
  {
    id: 80335,
    title: "Guardian Cross Kazak",
    size: `4'4" × 8'0"`,
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Kazak",
    lead: "Cross-form guardian medallions stacked on a madder ground. Tribal drawing in saturated naturals, original selvages.",
    collection: "antique-caucasian",
  },
  {
    id: 36192,
    title: "Armenian mosaic flatweave",
    size: `4'3" × 9'6"`,
    condition: "Excellent.",
    origin: "Caucasian",
    technique: "Hand-woven (flatweave)",
    pile: "Low",
    lead: "A long flatweave with stacked geometric panels — mosaic-like in rhythm, reversible. Low profile under a table or in a tight corridor.",
    collection: "antique-caucasian",
  },
  {
    id: 14010,
    title: "Tree of Life Lori",
    size: `4'6" × 8'0"`,
    condition: "Excellent.",
    origin: "Persian",
    region: "Lori",
    lead: "A Lori tribal tree-of-life — village drawing, saturated wool. The trunk runs the length of the field; the canopy spans the spandrels.",
    collection: "antique-persian",
  },
  {
    id: 31755,
    title: "Six Medallions Kazak",
    size: `4'2" × 9'3"`,
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Kazak",
    lead: "Six stacked geometric medallions on a long field. A Kazak runner with strong rhythm — works in a hallway or a stair landing.",
    collection: "antique-caucasian",
  },
  {
    id: 78529,
    title: "Armenian Legacy Karabagh (c. 1930)",
    size: `4'3" × 7'8"`,
    age: "c. 1930",
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Karabagh",
    lead: "A 1930s Karabagh in classical drawing. Even low pile, balanced palette, full original ends.",
    collection: "antique-caucasian",
  },
  {
    id: 31010,
    title: "Twin Medallion Oushak",
    size: `4'2" × 8'0"`,
    condition: "Good.",
    origin: "Turkish",
    region: "Oushak",
    lead: "An Oushak with paired medallions on a soft cream ground. Wear is even — pile reads as a quiet patina, not a flaw.",
    collection: "antique-turkish",
  },
  {
    id: 14149,
    title: "1888 Guardian Kazak",
    size: `3'9" × 8'10"`,
    age: "1888",
    condition: "Excellent.",
    origin: "Caucasian",
    region: "Kazak",
    lead: "A long Kazak from 1888 — guardian-figure infill on a long indigo field. Tribal drawing, saturated naturals.",
    collection: "antique-caucasian",
  },
  {
    id: 14204,
    title: "Shirvan Sunstone",
    size: `4'0" × 5'0"`,
    condition: "Good.",
    origin: "Caucasian",
    region: "Shirvan",
    lead: "A small Shirvan in warm naturals — sunstone gold, indigo, undyed ivory. Tight weave, classical drawing.",
    collection: "antique-caucasian",
  },
  {
    id: 25270,
    title: "Armenian Rose Palace",
    size: `7'0" × 14'4"`,
    condition: "Good.",
    origin: "Caucasian",
    region: "Karabagh",
    lead: "A large Karabagh on a rose ground. Classical garden drawing, sized for a long living room. Even wear through the field.",
    collection: "antique-caucasian",
  },
  {
    id: 86777,
    title: "Room-size hand-knotted wool rug",
    size: `9'0" × 12'1"`,
    condition: "Excellent.",
    origin: "Unspecified",
    lead: "A room-size hand-knotted wool rug from the latest delivery. Full pile, balanced drawing, ready for a living room.",
  },
  {
    id: 86335,
    title: "Oversize hand-knotted wool rug",
    size: `12'10" × 16'2"`,
    condition: "Excellent.",
    origin: "Unspecified",
    lead: "Oversize hand-knotted wool from the latest delivery — sized for a great room or a long dining table.",
  },
];

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
        ...(seed.age ? { age: { circa: seed.age, verified: true } } : {}),
        condition: seed.condition,
      },
      colorPalette: seed.enrichment?.colorPalette ?? [],
      designFeatures: seed.enrichment?.designFeatures ?? [],
      distinguishing: seed.enrichment?.distinguishing ?? [],
      provenance: {
        origin: seed.origin,
        ...(seed.region ? { region: seed.region } : {}),
        verified: true,
      },
    },
    images: [
      {
        src: localImage(seed.id),
        alt: `${seed.title}, ${sizeImperial}.`,
        primary: true,
      },
    ],
    updatedAt: "2026-06-24T00:00:00.000Z",
    draft: false,
  };
}

export const fixtureRugs: Rug[] = seeds.map(build);

export const collections = [
  { slug: "antique-persian", title: "Antique Persian" },
  { slug: "antique-turkish", title: "Antique Turkish" },
  { slug: "antique-caucasian", title: "Antique Caucasian" },
  { slug: "contemporary", title: "Contemporary" },
  { slug: "custom", title: "Custom & commission" },
];
