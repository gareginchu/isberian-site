/**
 * Vision-classify every rug image in /public/rugs/ using the same Claude vision system prompt
 * the live /identify route uses. Writes structured results to scripts/vision-results.json for
 * scripts/apply-vision-classify.ts to merge into the catalog.
 *
 * Usage (run from the repo root):
 *
 *   1. Ensure ANTHROPIC_API_KEY is set:
 *        - in .env.local  (preferred — git-ignored, never leaves your machine), or
 *        - in the shell:  `export ANTHROPIC_API_KEY=sk-ant-...`  (PowerShell: `$env:ANTHROPIC_API_KEY="sk-ant-..."`)
 *
 *   2. Run:
 *        pnpm vision:classify
 *
 *   3. Review scripts/vision-results.json. Then:
 *        pnpm vision:apply        # writes scripts/vision-patches.md
 *
 * Cost: ~$0.03 per rug at claude-sonnet-4-6. For all 46 rugs in the current catalog, ~$1.50.
 * Time: ~3 minutes at concurrency 4. Idempotent — skips rugs already in vision-results.json.
 */

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { IDENTIFY_SYSTEM } from "../lib/ai/prompts/identify";

// ── env loading ────────────────────────────────────────────────────────────────
// Tiny .env.local loader so we don't require an extra dependency.
async function loadEnvLocal() {
  try {
    const raw = await readFile(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
      if (!m) continue;
      const [, k, vRaw] = m;
      if (process.env[k!]) continue;
      const v = vRaw!.replace(/^["']|["']$/g, "");
      process.env[k!] = v;
    }
  } catch {
    // file missing is fine; user might be using shell env vars
  }
}

// ── types ──────────────────────────────────────────────────────────────────────
type ConfidenceGuess = { value: string; confidence: "low" | "medium" | "high" };

type VisionResult = {
  rugId: string;
  imagePath: string;
  classifiedAt: string;
  // matches the shape declared in lib/ai/prompts/identify.ts
  originGuess?: ConfidenceGuess;
  ageBandGuess?: ConfidenceGuess;
  typeGuess?: ConfidenceGuess;
  materialGuess?: ConfidenceGuess;
  tellsObserved?: string[];
  tellsMissing?: string[];
  note?: string;
  rawText?: string; // when JSON parse fails
  error?: string;
};

// ── main ───────────────────────────────────────────────────────────────────────
const CONCURRENCY = 4;
const MODEL = "claude-sonnet-4-6" as const;
const RUGS_DIR = resolve(process.cwd(), "public", "rugs");
const OUT_PATH = resolve(process.cwd(), "scripts", "vision-results.json");

async function listRugImages(): Promise<{ rugId: string; path: string }[]> {
  const files = await readdir(RUGS_DIR);
  return files
    .filter((f) => /\.jpe?g$/i.test(f))
    .map((f) => ({ rugId: `rug-${f.replace(/\.jpe?g$/i, "")}`, path: join(RUGS_DIR, f) }));
}

async function classifyOne(client: Anthropic, rugId: string, imagePath: string): Promise<VisionResult> {
  const data = (await readFile(imagePath)).toString("base64");
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: [{ type: "text", text: IDENTIFY_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data } },
            {
              type: "text",
              text: "This is a photograph of a single rug from a dealer catalog. Return the JSON described in the system prompt. No prose outside the JSON.",
            },
          ],
        },
      ],
    });
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return {
        rugId,
        imagePath,
        classifiedAt: new Date().toISOString(),
        ...parsed,
      };
    } catch {
      return { rugId, imagePath, classifiedAt: new Date().toISOString(), rawText: text };
    }
  } catch (err) {
    return {
      rugId,
      imagePath,
      classifiedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : "vision_error",
    };
  }
}

async function loadExisting(): Promise<Record<string, VisionResult>> {
  try {
    const raw = await readFile(OUT_PATH, "utf8");
    const arr = JSON.parse(raw) as VisionResult[];
    return Object.fromEntries(arr.map((r) => [r.rugId, r]));
  } catch {
    return {};
  }
}

async function persist(existing: Record<string, VisionResult>) {
  const list = Object.values(existing).sort((a, b) => a.rugId.localeCompare(b.rugId));
  await writeFile(OUT_PATH, JSON.stringify(list, null, 2), "utf8");
}

async function main() {
  await loadEnvLocal();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      "ANTHROPIC_API_KEY is not set.\n" +
        "  - Put it in .env.local at the repo root, OR\n" +
        '  - export ANTHROPIC_API_KEY=sk-ant-... (PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-...")',
    );
    process.exit(1);
  }
  const client = new Anthropic({ apiKey });

  // Sanity-check the rugs directory.
  try {
    const s = await stat(RUGS_DIR);
    if (!s.isDirectory()) throw new Error("not a directory");
  } catch {
    console.error(`No directory at ${RUGS_DIR}. Run from the repo root.`);
    process.exit(1);
  }

  const rugs = await listRugImages();
  const existing = await loadExisting();
  const todo = rugs.filter((r) => !existing[r.rugId]);

  console.log(`Found ${rugs.length} rug images; ${todo.length} need classification.`);
  if (todo.length === 0) {
    console.log(`Nothing to do. Delete ${OUT_PATH} to reclassify everything.`);
    return;
  }

  let done = 0;
  // Simple worker pool — concurrency = CONCURRENCY.
  async function worker() {
    for (;;) {
      const next = todo.shift();
      if (!next) return;
      const result = await classifyOne(client, next.rugId, next.path);
      existing[next.rugId] = result;
      done++;
      const tag = result.error ? `ERROR(${result.error.slice(0, 40)})` : result.originGuess?.value ?? "—";
      console.log(`[${done}/${rugs.length}] ${next.rugId.padEnd(10)} ${tag}`);
      // Persist after every result so a crash doesn't lose progress.
      await persist(existing);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  console.log(`\nDone. Results written to ${OUT_PATH}`);
  console.log(`Review the file, then run:  pnpm vision:apply`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
