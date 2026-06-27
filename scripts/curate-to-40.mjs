/**
 * After process-new-rugs.ts has audited + classified + drafted every new rug,
 * pick the best 40 across rug-type categories for maximum diversity, delete
 * everything else (images + drafts), and report the final catalog shape.
 *
 *   node scripts/curate-to-40.mjs
 *
 * Reads:
 *   lib/catalog/rug-audit.json     — full audit results with rugType per id
 *   lib/catalog/new-fixture-seeds.json — drafts (20 keepers + N new)
 *
 * Writes:
 *   lib/catalog/new-fixture-seeds.json — pruned to the chosen 40
 *   deletes: public/rugs/<id>.jpg for everything not in the 40
 */
import { readFile, writeFile, unlink, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RUGS_DIR = path.resolve(process.cwd(), "public", "rugs");
const AUDIT_PATH = path.resolve(process.cwd(), "lib", "catalog", "rug-audit.json");
const SEEDS_PATH = path.resolve(process.cwd(), "lib", "catalog", "new-fixture-seeds.json");

// Target distribution. Sum = 40. Categories without enough candidates are
// allocated to the next category over with the most overflow.
const TARGETS = {
  "antique-persian": 6,
  "antique-caucasian": 6,
  "antique-turkish": 4,
  "antique-european": 2,
  "moroccan": 3,
  "indian-agra": 2,
  "tibetan": 2,
  "scandinavian": 2,
  "contemporary-modern": 5,
  "contemporary-tribal": 2,
  "silk": 2,
  "flatweave-kilim": 2,
  "flatweave-soumak": 1,
  "runner-only": 1,
};

const KEEPER_IDS = new Set([
  "89134", "89111", "89090", "89082", "89068", "88889", "88885", "88859",
  "88857", "88855", "88853", "88851", "88849", "88847", "88845", "88843",
  "88841", "88839", "88837", "88834",
]);

// Pre-existing keepers don't have a rugType in audit (they were drafted earlier).
// Map them to types from their existing fixture data — sourced by inspecting
// new-fixture-seeds.json's `origin` + `collection` fields and visible patterns.
const KEEPER_TYPES = {
  "89134": "runner-only",       // Caucasian multi-stripe runner
  "89111": "antique-caucasian",
  "89090": "antique-caucasian",
  "89082": "antique-caucasian",
  "89068": "antique-caucasian",
  "88889": "contemporary-modern", // shag
  "88885": "antique-caucasian",
  "88859": "antique-caucasian",
  "88857": "antique-caucasian",
  "88855": "antique-caucasian",
  "88853": "antique-caucasian",
  "88851": "antique-caucasian",
  "88849": "antique-caucasian",
  "88847": "antique-caucasian",
  "88845": "antique-caucasian",
  "88843": "antique-caucasian",
  "88841": "antique-caucasian",
  "88839": "antique-caucasian",
  "88837": "antique-caucasian",
  "88834": "contemporary-modern", // distressed teal
};

async function main() {
  const audit = JSON.parse(await readFile(AUDIT_PATH, "utf8"));
  const seedsRaw = await readFile(SEEDS_PATH, "utf8");
  const allSeeds = JSON.parse(seedsRaw);

  // Build a map: rugId → type (from audit for newcomers, from KEEPER_TYPES for the 20)
  const typeByid = new Map();
  for (const id of KEEPER_IDS) typeByid.set(id, KEEPER_TYPES[id] ?? "antique-caucasian");
  for (const a of audit) {
    if (a.audit?.pass && a.rugType) typeByid.set(a.id, a.rugType);
  }

  // Group passing candidates by type.
  const passing = allSeeds.filter((s) => typeByid.has(String(s.id)));
  const byType = new Map();
  for (const seed of passing) {
    const t = typeByid.get(String(seed.id));
    if (!byType.has(t)) byType.set(t, []);
    byType.get(t).push(seed);
  }

  // Pick the chosen set.
  const chosen = [];
  const targetEntries = Object.entries(TARGETS);
  // First pass: take up to target from each type. Random-but-deterministic
  // (sort by id) so re-runs are stable.
  for (const [type, target] of targetEntries) {
    const pool = (byType.get(type) ?? []).sort((a, b) => a.id - b.id);
    chosen.push(...pool.slice(0, target));
  }
  // Second pass: if we're under 40, fill from any pool with leftovers.
  if (chosen.length < 40) {
    const chosenIds = new Set(chosen.map((s) => s.id));
    const leftovers = passing.filter((s) => !chosenIds.has(s.id));
    leftovers.sort((a, b) => a.id - b.id);
    for (const seed of leftovers) {
      if (chosen.length >= 40) break;
      chosen.push(seed);
    }
  }
  // Trim if we exceeded (shouldn't happen but safety).
  chosen.splice(40);

  console.log(`\nChosen ${chosen.length} rugs across types:`);
  const chosenByType = new Map();
  for (const seed of chosen) {
    const t = typeByid.get(String(seed.id)) ?? "unknown";
    chosenByType.set(t, (chosenByType.get(t) ?? 0) + 1);
  }
  for (const [t, n] of [...chosenByType.entries()].sort((a, b) => b[1] - a[1])) {
    const target = TARGETS[t] ?? "-";
    console.log(`  ${t.padEnd(28)} ${n}  (target ${target})`);
  }

  // Write the pruned seeds file.
  await writeFile(SEEDS_PATH, JSON.stringify(chosen, null, 2));
  console.log(`\nWrote pruned seeds: ${chosen.length} → ${SEEDS_PATH}`);

  // Delete every image NOT in the chosen set.
  const chosenIds = new Set(chosen.map((s) => String(s.id)));
  const allFiles = await readdir(RUGS_DIR);
  let deleted = 0;
  for (const f of allFiles) {
    const m = f.match(/^(\d+)\.jpg$/);
    if (!m) continue;
    if (!chosenIds.has(m[1])) {
      await unlink(path.join(RUGS_DIR, f));
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} non-chosen images. ${chosenIds.size} remain.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
