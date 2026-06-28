/**
 * v0 prototype — generate an "ideal room" image around a single rug.
 *
 * Reads the rug's structured RugDescription (palette, era, region, materials,
 * pile, size, design features) from new-fixture-seeds.json and builds a
 * prompt that asks the image model for a photographic interior whose
 * furniture, light, and color register all complement the rug.
 *
 * Generates THREE candidates (so we see the spread) via Flux 1.1 Pro on
 * Replicate. Saves to scripts/shots/rooms/<rug-id>__<n>.png for review.
 *
 *   pnpm tsx scripts/room-from-rug.ts [rug-id]   # default 17600
 *
 * Goal of v0: prove the visual register works. Compositing the real rug
 * photo onto the floor via perspective warp is a v1 follow-up; this just
 * tests whether prompt-from-RugDescription can stage a credible room.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN not set in .env.local");
  process.exit(1);
}

const SEEDS = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");
const OUT_DIR = path.resolve(process.cwd(), "scripts", "shots", "rooms");
const N_CANDIDATES = 3;

type PaletteEntry = { name: string; hex: string; weight: "primary" | "secondary" | "accent" };
type Rug = {
  id: number;
  title: string;
  size: string;
  origin: string;
  region?: string;
  age: string;
  technique: string;
  materials: string[];
  pile: string;
  lead: string;
  enrichment: {
    colorPalette: PaletteEntry[];
    designFeatures: string[];
    distinguishing: string[];
  };
};

/**
 * Map the rug's size string ("12'0\" × 13'0\"") into a setting register:
 * runners → hallway/foyer, scatters → bedside vignette, room-sized → living/dining.
 */
function settingFromSize(size: string): { room: string; furniture: string } {
  const m = size.match(/(\d+)'\s*(\d+)?"?\s*[×x]\s*(\d+)'\s*(\d+)?"?/);
  if (!m) return { room: "a large drawing room", furniture: "a low sofa, a pair of armchairs, a console table" };
  const w = parseInt(m[1] ?? "0", 10) * 12 + parseInt(m[2] ?? "0", 10);
  const l = parseInt(m[3] ?? "0", 10) * 12 + parseInt(m[4] ?? "0", 10);
  const longEdgeFt = Math.max(w, l) / 12;
  const aspect = Math.min(w, l) / Math.max(w, l);
  if (aspect < 0.45) return { room: "a long traditional hallway with a wood floor", furniture: "a console table with a brass lamp at the far end, two framed prints on the wall" };
  if (longEdgeFt < 6) return { room: "a quiet bedside vignette", furniture: "a low upholstered headboard, a walnut nightstand, a brass reading lamp" };
  if (longEdgeFt < 10) return { room: "an intimate sitting room", furniture: "a single tufted armchair, a side table with a brass lamp, a small writing desk" };
  if (longEdgeFt >= 14) return { room: "a grand formal dining room", furniture: "a long polished wood dining table with eight upholstered chairs, a brass chandelier overhead" };
  return { room: "a generous living room", furniture: "a low sectional sofa, a pair of armchairs, a marble coffee table, a console along the back wall" };
}

/**
 * Pick a light register from the dye character: warm madder reds and golds
 * read under tungsten / late afternoon; indigo and cool greens read under
 * north-facing daylight.
 */
function lightFromPalette(palette: PaletteEntry[]): string {
  const primary = palette.find((p) => p.weight === "primary") ?? palette[0];
  if (!primary) return "soft afternoon light through tall windows";
  const hex = primary.hex.toLowerCase();
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const warm = r > b + 20;
  const dark = (r + g + b) / 3 < 110;
  if (warm && dark) return "warm tungsten light from a single lamp, late evening";
  if (warm) return "late afternoon golden hour light through tall windows";
  if (dark) return "cool northern daylight, slightly overcast";
  return "soft diffuse daylight from north-facing windows";
}

/**
 * Pick an interior register from era / origin — antique Persian goes
 * traditional library; geometric Caucasian / Kazak goes architectural
 * modernist; contemporary distressed goes minimal industrial.
 */
function styleFromRug(rug: Rug): string {
  const age = rug.age.toLowerCase();
  const origin = rug.origin.toLowerCase();
  const isAntique = /18\d{2}|19[01]/.test(age) || age.includes("antique");
  const isContemporary = age.includes("contemporary") || /20[0-2]\d/.test(age);
  if (isContemporary) return "minimal contemporary interior, plaster walls, raw oak floor, restrained furnishings, gallery sensibility";
  if (origin.includes("caucasian") || origin.includes("kazak")) return "architectural modernist room, white plaster walls, mid-century furniture in walnut and black leather, clean lines";
  if (isAntique && (origin.includes("persian") || origin.includes("tabriz") || origin.includes("sultanabad"))) {
    return "traditional gentleman's library, walnut wainscot, leather-bound books on built-in shelves, a deep wing chair, a wooden writing desk";
  }
  return "warm classical interior, plaster walls, hardwood floor, upholstered seating, brass details";
}

function buildPrompt(rug: Rug): string {
  const setting = settingFromSize(rug.size);
  const light = lightFromPalette(rug.enrichment.colorPalette);
  const style = styleFromRug(rug);

  const palette = rug.enrichment.colorPalette
    .map((p) => `${p.name.toLowerCase()} (${p.hex})`)
    .join(", ");
  const primary = rug.enrichment.colorPalette.find((p) => p.weight === "primary");
  const secondary = rug.enrichment.colorPalette.filter((p) => p.weight === "secondary").map((p) => p.name.toLowerCase());

  // Subject: the rug on the floor, described as it would appear photographically.
  const rugDescription = `a ${rug.size} hand-knotted ${rug.origin} ${rug.region ? rug.region + " " : ""}rug, ${rug.age}, ${rug.materials.join(" and ").toLowerCase()}, ${rug.pile.toLowerCase()} pile, on the floor — ${rug.lead.toLowerCase().replace(/\.$/, "")}`;

  return [
    "Photorealistic editorial interior photograph, shot on medium-format film, shallow grain.",
    `Scene: ${setting.room}.`,
    `Style register: ${style}.`,
    `Furnishings: ${setting.furniture}.`,
    `Lighting: ${light}.`,
    `Wall and upholstery palette tuned to complement the rug — primary tones around ${primary?.name.toLowerCase() ?? "ivory"} and accents in ${secondary.join(", ") || "soft warm neutrals"}; never out-saturate the rug.`,
    `On the floor: ${rugDescription}. Rug colors: ${palette}.`,
    "Composition: the rug is the room's anchor; furniture frames but does not crowd it; eye-level camera, ample negative space, no people, no clutter, no text or signage.",
    "Reference: Architectural Digest, Vogue Living, restrained gallery-style editorial photography.",
  ].join(" ");
}

async function generate(prompt: string): Promise<string> {
  // Replicate's official model endpoint for Flux 1.1 Pro — returns a single PNG URL.
  const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: "3:2",
        output_format: "png",
        output_quality: 95,
        safety_tolerance: 5,
        prompt_upsampling: true,
      },
    }),
  });
  if (!res.ok) throw new Error(`replicate ${res.status}: ${await res.text()}`);
  const prediction = await res.json();
  if (prediction.status === "failed") throw new Error(prediction.error ?? "prediction failed");
  // With Prefer: wait, the response usually contains output immediately; poll otherwise.
  let final = prediction;
  while (final.status !== "succeeded" && final.status !== "failed") {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(final.urls.get, { headers: { Authorization: `Bearer ${TOKEN}` } });
    final = await poll.json();
    process.stdout.write(".");
  }
  if (final.status === "failed") throw new Error(final.error ?? "prediction failed");
  const url = Array.isArray(final.output) ? final.output[0] : final.output;
  if (!url) throw new Error("no output url");
  return url;
}

async function main() {
  const rugId = process.argv[2] ?? "17600";
  const seeds: Rug[] = JSON.parse(await readFile(SEEDS, "utf8"));
  const rug = seeds.find((r) => String(r.id) === rugId);
  if (!rug) {
    console.error(`rug ${rugId} not in seeds`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const prompt = buildPrompt(rug);
  console.log(`\n→ ${rug.title} (${rug.id})\n`);
  console.log(`prompt:\n${prompt}\n`);
  console.log(`generating ${N_CANDIDATES} candidate(s)…`);

  const urls: string[] = [];
  for (let i = 1; i <= N_CANDIDATES; i++) {
    process.stdout.write(`  ${i}/${N_CANDIDATES} `);
    // Replicate throttles to 6/min with a burst of 1 under $5 balance. Pause
    // between candidates so we don't lose them to 429s.
    if (i > 1) {
      process.stdout.write("(waiting 12s for rate limit) ");
      await new Promise((r) => setTimeout(r, 12000));
    }
    try {
      const url = await generate(prompt);
      urls.push(url);
      const ab = (await (await fetch(url)).arrayBuffer()) as ArrayBuffer;
      const buf = Buffer.from(ab);
      const out = path.join(OUT_DIR, `${rug.id}__${i}.png`);
      await writeFile(out, buf);
      console.log(`  → ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.warn(`  failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\ndone. ${urls.length}/${N_CANDIDATES} succeeded. Review files in scripts/shots/rooms/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
