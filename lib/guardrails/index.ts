// The five rules, centralized. Every assistant response, every AI-drafted copy, and the eval
// harness import from here. Do not re-encode these rules ad hoc elsewhere.
//
// 1. No prices, ever.                 — see ./price
// 2. No fabricated inventory.         — see ./inventory
// 3. No valuations or authenticity.   — see ./valuation
// 4. No risky DIY on antique/silk.    — see ./diy
// 5. Always a visible human exit.     — see ./human-exit

export { findPricePhrases, redactPricePhrases, hasPriceLeak } from "./price";
export { hasFabricatedInventory, requireKnownRugIds } from "./inventory";
export { hasValuationClaim, hedgeValuationLanguage } from "./valuation";
export { isRiskyDiyAdvice, routeIfRisky } from "./diy";
export { humanExitContent, HUMAN_EXIT_REQUIRED_ON } from "./human-exit";

import { hasPriceLeak } from "./price";
import { hasValuationClaim } from "./valuation";
import { isRiskyDiyAdvice } from "./diy";

export type GuardrailFinding = {
  rule: "price" | "valuation" | "diy" | "inventory" | "human-exit";
  severity: "block" | "rewrite" | "warn";
  message: string;
  matches?: string[];
};

/**
 * Scan a single string of model output for guardrail violations the model is most likely to make.
 * Inventory and human-exit checks are structural (require context outside the string) and live in
 * the orchestrator; this function covers the language-level checks.
 */
export function scanAssistantText(text: string, _ctx: { rugIdsInScope?: string[] } = {}): GuardrailFinding[] {
  const findings: GuardrailFinding[] = [];
  const price = hasPriceLeak(text);
  if (price.violated) {
    findings.push({
      rule: "price",
      severity: "block",
      message:
        "Output contained a price, range, or 'from $...' phrase. Rugs are quoted only; route to a quote, visit, or wishlist.",
      matches: price.matches,
    });
  }
  const val = hasValuationClaim(text);
  if (val.violated) {
    findings.push({
      rule: "valuation",
      severity: "rewrite",
      message:
        "Output asserted a valuation, authentication, or age guarantee. Hedge to 'preliminary' and route to in-person appraisal.",
      matches: val.matches,
    });
  }
  const diy = isRiskyDiyAdvice(text);
  if (diy.violated) {
    findings.push({
      rule: "diy",
      severity: "rewrite",
      message:
        "Output suggested DIY cleaning or repair that could damage antique/silk/valuable pieces. Route to professional service.",
      matches: diy.matches,
    });
  }
  return findings;
}
