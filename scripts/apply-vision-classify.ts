/**
 * Read scripts/vision-results.json and produce a patch summary for fixtures.ts.
 *
 *   pnpm vision:apply
 *
 * Outputs scripts/vision-patches.md — a human-readable diff: for each rug, what the AI said vs.
 * what fixtures.ts currently says. You then hand-merge the changes you trust into fixtures.ts.
 *
 * The script is intentionally non-destructive. The editorial pass on a rug catalog should never
 * be fully automatic; this is the editor queue described in CLAUDE.md.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fixtureRugs } from "../lib/catalog/fixtures";

type ConfidenceGuess = { value: string; confidence: "low" | "medium" | "high" };
type VisionResult = {
  rugId: string;
  imagePath: string;
  classifiedAt: string;
  originGuess?: ConfidenceGuess;
  ageBandGuess?: ConfidenceGuess;
  typeGuess?: ConfidenceGuess;
  materialGuess?: ConfidenceGuess;
  tellsObserved?: string[];
  tellsMissing?: string[];
  note?: string;
  rawText?: string;
  error?: string;
};

const IN = resolve(process.cwd(), "scripts", "vision-results.json");
const OUT = resolve(process.cwd(), "scripts", "vision-patches.md");

function conf(g?: ConfidenceGuess): string {
  if (!g) return "—";
  return `${g.value} (${g.confidence})`;
}

async function main() {
  const raw = await readFile(IN, "utf8").catch(() => {
    console.error(`No vision results at ${IN}. Run \`pnpm vision:classify\` first.`);
    process.exit(1);
  });
  const results = JSON.parse(raw as string) as VisionResult[];
  const byId = new Map(results.map((r) => [r.rugId, r]));

  const lines: string[] = [];
  lines.push("# Vision-classification review");
  lines.push("");
  lines.push(
    "Each rug below shows what the catalog currently says vs. what the AI saw. Use this as an editor checklist — apply the changes you trust to `lib/catalog/fixtures.ts`.",
  );
  lines.push("");

  let agree = 0;
  let disagree = 0;
  let lowConf = 0;
  let errored = 0;

  for (const rug of fixtureRugs) {
    const r = byId.get(rug.id);
    if (!r) continue;

    if (r.error) {
      errored++;
      lines.push(`## ${rug.title} (${rug.id}) — ERROR`);
      lines.push(`> \`${r.error}\``);
      lines.push("");
      continue;
    }

    const currentOrigin = rug.description.provenance.origin;
    const currentRegion = rug.description.provenance.region ?? "—";
    const currentAge = rug.description.details.age?.circa ?? "—";

    const aiOrigin = r.originGuess?.value ?? "—";
    const originAgrees = aiOrigin.toLowerCase().includes(currentOrigin.toLowerCase()) ||
      currentOrigin.toLowerCase().includes(aiOrigin.toLowerCase().split(" ")[0] ?? "");

    if (r.originGuess?.confidence === "low") lowConf++;
    if (originAgrees) agree++;
    else disagree++;

    const flag = originAgrees ? "✔" : "⚠";
    lines.push(`## ${flag} ${rug.title}  (\`${rug.id}\`)`);
    lines.push("");
    lines.push("| Field | Catalog | AI vision |");
    lines.push("| --- | --- | --- |");
    lines.push(`| Origin | ${currentOrigin} | **${conf(r.originGuess)}** |`);
    lines.push(`| Region/Type | ${currentRegion} | ${conf(r.typeGuess)} |`);
    lines.push(`| Age | ${currentAge} | ${conf(r.ageBandGuess)} |`);
    lines.push(`| Material | ${rug.description.details.materials.join(", ")} | ${conf(r.materialGuess)} |`);
    if (r.tellsObserved?.length) lines.push(`| Tells observed | — | ${r.tellsObserved.join("; ")} |`);
    if (r.tellsMissing?.length) lines.push(`| Missing in photo | — | ${r.tellsMissing.join("; ")} |`);
    if (r.note) lines.push(`| Note | — | ${r.note} |`);
    lines.push("");
  }

  lines.unshift("");
  lines.unshift(
    `Summary: ${agree} agree · ${disagree} disagree · ${lowConf} low-confidence · ${errored} errored.`,
  );
  lines.unshift("");
  lines.unshift("# Vision-classification review");

  await writeFile(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(
    `Summary: ${agree} agree, ${disagree} disagree, ${lowConf} low-confidence, ${errored} errored.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
