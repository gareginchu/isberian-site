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
};

const seeds: Seed[] = [
  // ── Editorially enriched ──────────────────────────────────────────────
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
      designFeatures: ["central imperial medallion", "stepped spandrels", "running-dog border", "geometric guard stripes", "dated cartouche"],
      distinguishing: ["dated 1888 in the corner — woven into the foundation", "yellow ochre highlights uncommon for the form", "original selvages on both long sides"],
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
      designFeatures: ["central geometric medallion", "stepped spandrels", "Karabagh lattice border", "saturated madder ground"],
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
      designFeatures: ["all-over Herati", "elongated medallion", "fine drawing", "soft ivory ground"],
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
      designFeatures: ["cloud-band motif", "open ivory field", "indigo guard stripes", "soft drawing"],
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
      designFeatures: ["all-over rosette", "ivory drawing", "indigo border", "long format"],
      distinguishing: ["rose ground at this length is genuinely uncommon"],
    },
    collection: "antique-caucasian",
  },

  // ── Lean fixtures ─────────────────────────────────────────────────────
  { id: 84070, title: "Antique Armenian Kazak wool rug", size: `5'1" × 8'3"`, condition: "Excellent.", origin: "Caucasian", region: "Kazak", lead: "A Caucasian Kazak with bold geometry on a madder ground. Natural-dye palette, full pile, original selvages.", collection: "antique-caucasian" },
  { id: 18778, title: "Ruby Highlands Kazak", size: `4'10" × 5'6"`, condition: "Excellent.", origin: "Caucasian", region: "Kazak", lead: "A small Kazak in deep ruby and indigo. Stepped medallion, tight geometric border, even pile through the field.", collection: "antique-caucasian" },
  { id: 67432, title: "Eternal Wave Caucasian", size: `5'1" × 7'2"`, condition: "Excellent.", origin: "Caucasian", lead: "A Caucasian piece with a running wave field — repeated geometry that reads quiet at distance and intricate up close.", collection: "antique-caucasian" },
  { id: 70703, title: "Armenian Autumn", size: `3'10" × 5'10"`, condition: "Excellent.", origin: "Caucasian", region: "Karabagh", lead: "A scatter-size piece in autumnal palette — burnt madder, soft ochres, undyed ivory. Even pile through the field.", collection: "antique-caucasian" },
  { id: 80335, title: "Guardian Cross Kazak", size: `4'4" × 8'0"`, condition: "Excellent.", origin: "Caucasian", region: "Kazak", lead: "Cross-form guardian medallions stacked on a madder ground. Tribal drawing in saturated naturals, original selvages.", collection: "antique-caucasian" },
  { id: 36192, title: "Armenian mosaic flatweave", size: `4'3" × 9'6"`, condition: "Excellent.", origin: "Caucasian", technique: "Hand-woven (flatweave)", pile: "Low", lead: "A long flatweave with stacked geometric panels — mosaic-like in rhythm, reversible. Low profile under a table or in a tight corridor.", collection: "antique-caucasian" },
  { id: 14010, title: "Tree of Life Lori", size: `4'6" × 8'0"`, condition: "Excellent.", origin: "Persian", region: "Lori", lead: "A Lori tribal tree-of-life — village drawing, saturated wool. The trunk runs the length of the field; the canopy spans the spandrels.", collection: "antique-persian" },
  { id: 31755, title: "Six Medallions Kazak", size: `4'2" × 9'3"`, condition: "Excellent.", origin: "Caucasian", region: "Kazak", lead: "Six stacked geometric medallions on a long field. A Kazak runner with strong rhythm — works in a hallway or a stair landing.", collection: "antique-caucasian" },
  { id: 78529, title: "Armenian Legacy Karabagh (c. 1930)", size: `4'3" × 7'8"`, age: "c. 1930", condition: "Excellent.", origin: "Caucasian", region: "Karabagh", lead: "A 1930s Karabagh in classical drawing. Even low pile, balanced palette, full original ends.", collection: "antique-caucasian" },
  { id: 31010, title: "Twin Medallion Oushak", size: `4'2" × 8'0"`, condition: "Good.", origin: "Turkish", region: "Oushak", lead: "An Oushak with paired medallions on a soft cream ground. Wear is even — pile reads as a quiet patina, not a flaw.", collection: "antique-turkish" },
  { id: 14149, title: "1888 Guardian Kazak", size: `3'9" × 8'10"`, age: "1888", condition: "Excellent.", origin: "Caucasian", region: "Kazak", lead: "A long Kazak from 1888 — guardian-figure infill on a long indigo field. Tribal drawing, saturated naturals.", collection: "antique-caucasian" },
  { id: 14204, title: "Shirvan Sunstone", size: `4'0" × 5'0"`, condition: "Good.", origin: "Caucasian", region: "Shirvan", lead: "A small Shirvan in warm naturals — sunstone gold, indigo, undyed ivory. Tight weave, classical drawing.", collection: "antique-caucasian" },
  { id: 25270, title: "Armenian Rose Palace", size: `7'0" × 14'4"`, condition: "Good.", origin: "Caucasian", region: "Karabagh", lead: "A large Karabagh on a rose ground. Classical garden drawing, sized for a long living room. Even wear through the field.", collection: "antique-caucasian" },
  { id: 86777, title: "Room-size hand-knotted wool rug", size: `9'0" × 12'1"`, condition: "Excellent.", origin: "Unspecified", lead: "A room-size hand-knotted wool rug from the latest delivery. Full pile, balanced drawing, ready for a living room." },
  { id: 86335, title: "Oversize hand-knotted wool rug", size: `12'10" × 16'2"`, condition: "Excellent.", origin: "Unspecified", lead: "Oversize hand-knotted wool from the latest delivery — sized for a great room or a long dining table." },

  // ── New batch ─────────────────────────────────────────────────────────
  { id: 43370, title: "Caucasus Ladder", size: `4'5" × 9'0"`, condition: "Excellent.", origin: "Caucasian", lead: "Ladder geometry running the length of the field — repeated stepped medallions on a long Caucasian runner.", collection: "antique-caucasian" },
  { id: 80337, title: "Floral Prayer Karabagh", size: `3'6" × 6'3"`, condition: "Excellent.", origin: "Caucasian", region: "Karabagh", lead: "A small Karabagh prayer rug with a floral arch on a soft ground. Tight weave, original ends.", collection: "antique-caucasian" },
  { id: 77548, title: "Crimson Gate Rug", size: `5'3" × 6'0"`, condition: "Good.", origin: "Caucasian", lead: "A near-square Caucasian piece with a crimson field and an arched gate motif at the head. Balanced palette, even pile.", collection: "antique-caucasian" },
  { id: 31018, title: "Antique Armenian Kazak (scatter)", size: `4'4" × 5'9"`, condition: "Some restoration noted.", origin: "Caucasian", region: "Kazak", lead: "A scatter-size Kazak with light reweaves to the field. Geometry intact, drawing strong, palette saturated.", collection: "antique-caucasian" },
  { id: 24122, title: "Six Guardians Kazak", size: `4'0" × 8'0"`, condition: "Excellent.", origin: "Caucasian", region: "Kazak", lead: "Six guardian figures lined down a madder field. Tribal drawing in heavy natural wools.", collection: "antique-caucasian" },
  { id: 84195, title: "Karabagh Muse Runner", size: `3'10" × 13'3"`, condition: "Good.", origin: "Caucasian", region: "Karabagh", lead: "A long Karabagh runner — soft palette, all-over botanical drawing. The kind of runner that lives in a long second-floor hallway.", collection: "antique-caucasian" },
  { id: 17370, title: "Sapphire Nomad", size: `4'5" × 8'0"`, condition: "Good.", origin: "Caucasian", lead: "A nomadic-feeling Caucasian piece on a sapphire field. Hand of a working textile; saturated dyes.", collection: "antique-caucasian" },
  { id: 19016, title: "Path of Harmony", size: `4'4" × 10'8"`, condition: "Good.", origin: "Caucasian", lead: "A long Caucasian piece with a path-like central column running its length. Calm field, restrained drawing.", collection: "antique-caucasian" },
  { id: 77546, title: "Ruby Frame Kazak", size: `4'0" × 6'0"`, condition: "Good.", origin: "Caucasian", region: "Kazak", lead: "A small Kazak framed by a ruby border. The drawing is the field; the border holds it.", collection: "antique-caucasian" },
  { id: 22085, title: "Eagle Crest Karabagh", size: `4'2" × 8'9"`, condition: "Good.", origin: "Caucasian", region: "Karabagh", lead: "An eagle-crest medallion on a Karabagh field. Indigo and madder in even balance.", collection: "antique-caucasian" },
  { id: 32364, title: "Mountain Crest Karabagh", size: `4'0" × 6'0"`, condition: "Good.", origin: "Caucasian", region: "Karabagh", lead: "Stacked mountain-crest motifs running the length of a Karabagh field. Compact, tribal.", collection: "antique-caucasian" },
  { id: 34545, title: "Caucasus Flame Karabagh", size: `4'4" × 6'6"`, condition: "Good.", origin: "Caucasian", region: "Karabagh", lead: "A flame-like central motif on a Karabagh ground — saturated madder, indigo guard stripes.", collection: "antique-caucasian" },
  { id: 43371, title: "Eternal Emblem Rug", size: `5'0" × 8'4"`, condition: "Good.", origin: "Caucasian", lead: "A repeated emblem motif on a calm field — a quietly graphic Caucasian piece.", collection: "antique-caucasian" },
  { id: 43373, title: "Armenian Bloom Rug", size: `6'10" × 14'2"`, condition: "Good.", origin: "Caucasian", lead: "A long Caucasian piece with bloom-like medallions running its length. Even wear, balanced palette.", collection: "antique-caucasian" },
  { id: 43911, title: "Ancient Harmony Runner", size: `3'9" × 9'2"`, condition: "Good.", origin: "Caucasian", lead: "A long Caucasian runner with classical drawing — even rhythm, soft naturals.", collection: "antique-caucasian" },
  { id: 51108, title: "Ararat Sky Rug", size: `6'0" × 7'8"`, condition: "Good.", origin: "Caucasian", lead: "A Caucasian piece with a sky-blue field and ivory drawing. Quieter ground than madder; same restraint.", collection: "antique-caucasian" },
  { id: 52285, title: "Cloud Path Runner", size: `4'2" × 9'6"`, condition: "Good.", origin: "Caucasian", lead: "Cloud-band motifs walking down a long runner field. Calm rhythm, full pile.", collection: "antique-caucasian" },
  { id: 53276, title: "Whisper Bloom Rug", size: `3'10" × 5'8"`, condition: "Good.", origin: "Caucasian", lead: "A small piece with a whispered floral drawing on a soft field. Reads as quiet patina rather than wear.", collection: "antique-caucasian" },
  { id: 62274, title: "Golden Garden Rug", size: `4'0" × 5'3"`, condition: "Good.", origin: "Caucasian", lead: "A small piece with a soft golden ground and a garden drawing. Even pile, balanced palette.", collection: "antique-caucasian" },
  { id: 63000, title: "Armenian Royal Medallion", size: `4'6" × 6'7"`, condition: "Good.", origin: "Caucasian", lead: "A central royal-medallion drawing on a Caucasian field. Sized for a small living room or below a console.", collection: "antique-caucasian" },
  { id: 69068, title: "Crimson Garden Karabagh", size: `7'0" × 15'0"`, condition: "Good.", origin: "Caucasian", region: "Karabagh", lead: "A long Karabagh on a crimson ground with a garden drawing. Sized for a long living room or a wide entry.", collection: "antique-caucasian" },
  { id: 73404, title: "Highland Path Rug (scatter)", size: `2'8" × 4'9"`, condition: "Good.", origin: "Caucasian", lead: "A scatter-size Caucasian piece with stepped highland geometry. Saturated naturals, even pile.", collection: "antique-caucasian" },
  { id: 76522, title: "Armenian Royal Medallion (larger)", size: `5'3" × 7'6"`, condition: "Good.", origin: "Caucasian", lead: "A larger royal-medallion piece — same restrained drawing, scaled for a more generous room.", collection: "antique-caucasian" },
  { id: 76820, title: "Crimson Gate Rug (small)", size: `3'1" × 4'8"`, condition: "Good.", origin: "Caucasian", lead: "A small crimson-ground piece with a gate motif at the head — easy in an entry or a child's room.", collection: "antique-caucasian" },
  { id: 77529, title: "Highland Path Rug (room-size)", size: `5'6" × 9'4"`, condition: "Good.", origin: "Caucasian", lead: "A room-size highland-path piece — stepped geometry running the length, balanced naturals.", collection: "antique-caucasian" },
  { id: 76404, title: "Tree of Life", size: `4'4" × 7'11"`, condition: "Good.", origin: "Caucasian", lead: "A Tree of Life on a calm field — symmetric, restrained, the trunk running the length.", collection: "antique-caucasian" },
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
