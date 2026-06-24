// Rule 1: No prices, ever. Quoted only.
//
// Catches dollar amounts, ranges, "starting at", "from $...", "per square foot", "asking price",
// "valued at", "wholesale at", "retail $". This list is intentionally broad — the cost of a false
// positive (rewriting "around three to four" in unrelated context) is small; the cost of a leak
// is brand- and trust-damaging.

const PRICE_PATTERNS: RegExp[] = [
  /\$\s?\d[\d,]*(?:\.\d{1,2})?/g, // $1,200, $899.99
  /\b(?:USD|EUR|GBP)\s?\d[\d,]*(?:\.\d{1,2})?/gi,
  /\b\d[\d,]*(?:\.\d{1,2})?\s*(?:dollars|euros|pounds)\b/gi,
  /\bfrom\s+\$?\d/gi,
  /\bstart(?:s|ing)\s+at\s+\$?\d/gi,
  /\bpriced\s+at\b/gi,
  /\bprice\s+(?:is|of|tag|range|point)\b/gi,
  /\bretail(?:s|ing)?\s+(?:for|at)\b/gi,
  /\bwholesale\s+(?:for|at|price)\b/gi,
  /\b(?:asking|estimated|appraised|market|fair)\s+(?:price|value)\b/gi,
  /\bper\s+square\s+(?:foot|metre|meter)\b/gi,
  /\b\d+\s*(?:k|K)\s*(?:dollars|usd)?\b/g, // "5k", "10K"
];

export function findPricePhrases(text: string): string[] {
  const out: string[] = [];
  for (const re of PRICE_PATTERNS) {
    const matches = text.match(re);
    if (matches) out.push(...matches);
  }
  return out;
}

export function hasPriceLeak(text: string): { violated: boolean; matches: string[] } {
  const matches = findPricePhrases(text);
  return { violated: matches.length > 0, matches };
}

export function redactPricePhrases(text: string): string {
  let out = text;
  for (const re of PRICE_PATTERNS) out = out.replace(re, "[quoted on request]");
  return out;
}
