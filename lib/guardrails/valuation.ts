// Rule 3: No valuations or authenticity guarantees. Rug ID is always preliminary.

const VALUATION_PATTERNS: RegExp[] = [
  /\b(?:worth|value|valued)\s+(?:approximately|about|around|over|under|at)?\s*\$?\d/gi,
  /\b(?:appraised|appraisal)\s+(?:at|value)\b/gi,
  /\b(?:authentic|guarantee|guaranteed|certified|certify|verified)\b/gi,
  /\bdefinitely\s+(?:antique|persian|tabriz|heriz|kashan|silk)/gi,
  /\b(?:I|we)\s+(?:can\s+)?(?:confirm|guarantee|certify)/gi,
  /\b100\s?%\s+(?:authentic|silk|wool|original)/gi,
];

export function hasValuationClaim(text: string): { violated: boolean; matches: string[] } {
  const matches: string[] = [];
  for (const re of VALUATION_PATTERNS) {
    const m = text.match(re);
    if (m) matches.push(...m);
  }
  return { violated: matches.length > 0, matches };
}

/**
 * Soft rewrite — wrap certainty language in "appears to be / is consistent with" hedges.
 * Used by the enrichment editor queue as a suggestion, not an auto-apply.
 */
export function hedgeValuationLanguage(text: string): string {
  return text
    .replace(/\bauthentic\b/gi, "appears authentic on visual inspection")
    .replace(/\bguaranteed?\b/gi, "preliminary")
    .replace(/\bcertified\b/gi, "preliminary")
    .replace(/\bdefinitely\b/gi, "appears to be");
}
