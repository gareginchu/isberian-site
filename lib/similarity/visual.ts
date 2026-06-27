/**
 * Visual similarity over precomputed CLIP image embeddings.
 *
 * Embeddings are produced offline by `scripts/embed-rugs.ts` (Transformers.js +
 * CLIP ViT-B/32). Each rug image becomes an L2-normalized 512-dim vector. The
 * server never loads the model — just the JSON of vectors — and computes
 * cosine similarity as a dot product at query time.
 */

import embeddingsRaw from "./embeddings.json" with { type: "json" };

const EMBEDDINGS: Record<string, number[]> = embeddingsRaw as Record<string, number[]>;

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/**
 * Return up to `limit` rug ids ranked by visual similarity to `rugId`, most
 * similar first. The source rug itself is excluded from the result. Rugs that
 * don't have a precomputed embedding are silently skipped.
 */
export function similarRugIds(rugId: string, limit = 6): string[] {
  const source = EMBEDDINGS[rugId];
  if (!source) return [];
  const scored: { id: string; score: number }[] = [];
  for (const [id, vec] of Object.entries(EMBEDDINGS)) {
    if (id === rugId) continue;
    scored.push({ id, score: dot(source, vec) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.id);
}

/** Total rugs that have a precomputed embedding. Useful for diagnostics. */
export function embeddingCoverage(): number {
  return Object.keys(EMBEDDINGS).length;
}
