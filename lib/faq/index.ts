import type { FaqEntry, CareGuide } from "@/lib/types/faq";
import { faqEntries, careGuides } from "./kb";
import { sanity } from "@/lib/sanity/client";

/**
 * FAQ / care KB retrieval. When NEXT_PUBLIC_SANITY_PROJECT_ID is set, reads live from Sanity;
 * otherwise serves the curated fixtures. Same shape either way so the concierge orchestrator,
 * the /care pages, and the eval suite don't care which source is active.
 *
 * Low-confidence retrieval returns `routesToHuman: true` so the model hands off rather than guesses.
 */

const TERM_BOOST = 2;
const TITLE_BOOST = 3;

const FAQ_QUERY = /* groq */ `*[_type == "faqEntry"] | order(category asc, question asc) {
  "id": _id,
  "slug": slug.current,
  category,
  question,
  answer,
  routing,
  routesToHuman,
  verified,
  "updatedAt": coalesce(_updatedAt, _createdAt)
}`;

const CARE_QUERY = /* groq */ `*[_type == "careGuide"] | order(title asc) {
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  body,
  routing,
  "related": coalesce(related[]->_id, []),
  "updatedAt": coalesce(_updatedAt, _createdAt)
}`;

async function fetchFaq(): Promise<FaqEntry[]> {
  const client = sanity();
  if (!client) return faqEntries;
  try {
    const live = await client.fetch<FaqEntry[]>(FAQ_QUERY);
    return live?.length ? live : faqEntries;
  } catch (err) {
    console.warn("[faq] Sanity fetch failed, falling back to fixtures", err);
    return faqEntries;
  }
}

async function fetchCare(): Promise<CareGuide[]> {
  const client = sanity();
  if (!client) return careGuides;
  try {
    const live = await client.fetch<CareGuide[]>(CARE_QUERY);
    return live?.length ? live : careGuides;
  } catch (err) {
    console.warn("[care] Sanity fetch failed, falling back to fixtures", err);
    return careGuides;
  }
}

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
  if (
    qWord.split(/\s+/).filter((t) => qSet.has(t)).length > 0 &&
    entry.category === "care" &&
    /clean|wash|spill|stain|care|silk|vacuum|moth/.test(qStr)
  ) {
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
  const all = await fetchFaq();
  const pool = category ? all.filter((e) => e.category === category) : all;
  const scored = pool.map((e) => ({ e, s: scoreEntry(e, qTokens) })).sort((a, b) => b.s - a.s);
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
  return fetchFaq();
}

export async function getFaq(slug: string): Promise<FaqEntry | null> {
  const all = await fetchFaq();
  return all.find((e) => e.slug === slug) ?? null;
}

export async function listCare(): Promise<CareGuide[]> {
  return fetchCare();
}

export async function getCare(slug: string): Promise<CareGuide | null> {
  const all = await fetchCare();
  return all.find((c) => c.slug === slug) ?? null;
}
