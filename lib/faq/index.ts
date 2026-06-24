import type { FaqEntry, CareGuide } from "@/lib/types/faq";
import { faqEntries, careGuides } from "./kb";

/**
 * FAQ / care KB retrieval. Real implementation will use pgvector + a small BM25 fallback. The
 * concierge orchestrator calls `answerFaq`; the public /care pages render `listFaq`/`getCare`.
 *
 * Low-confidence retrieval returns `routesToHuman: true` so the model hands off rather than guesses.
 */

const TERM_BOOST = 2;
const TITLE_BOOST = 3;

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function scoreEntry(entry: FaqEntry, qTokens: string[]): number {
  const qSet = new Set(qTokens);
  const qStr = qTokens.join(" ");
  const qWord = entry.question.toLowerCase();
  const aWord = entry.answer.toLowerCase();
  let score = 0;
  for (const t of qTokens) {
    if (qWord.includes(t)) score += TITLE_BOOST;
    if (aWord.includes(t)) score += TERM_BOOST;
  }
  // category nudge
  if (qWord.split(/\s+/).filter((t) => qSet.has(t)).length > 0 && entry.category === "care" && /clean|wash|spill|stain|care|silk|vacuum|moth/.test(qStr)) {
    score += 1;
  }
  return score;
}

export type FaqAnswer = {
  matched: FaqEntry | null;
  confidence: "low" | "medium" | "high";
  routesToHuman: boolean;
  category?: string;
};

export async function answerFaq(query: string, category?: string): Promise<FaqAnswer> {
  const qTokens = tokens(query);
  const pool = category ? faqEntries.filter((e) => e.category === category) : faqEntries;
  const scored = pool
    .map((e) => ({ e, s: scoreEntry(e, qTokens) }))
    .sort((a, b) => b.s - a.s);
  const top = scored[0];
  if (!top || top.s === 0) {
    return { matched: null, confidence: "low", routesToHuman: true };
  }
  const confidence: FaqAnswer["confidence"] = top.s >= 6 ? "high" : top.s >= 3 ? "medium" : "low";
  return {
    matched: top.e,
    confidence,
    routesToHuman: confidence === "low" || top.e.routesToHuman,
    category: top.e.category,
  };
}

export async function listFaq(): Promise<FaqEntry[]> {
  return faqEntries;
}

export async function getFaq(slug: string): Promise<FaqEntry | null> {
  return faqEntries.find((e) => e.slug === slug) ?? null;
}

export async function listCare(): Promise<CareGuide[]> {
  return careGuides;
}

export async function getCare(slug: string): Promise<CareGuide | null> {
  return careGuides.find((c) => c.slug === slug) ?? null;
}
