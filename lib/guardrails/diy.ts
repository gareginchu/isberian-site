// Rule 4: No risky DIY for valuable/antique/silk pieces — route to inspection.
//
// Heuristic: pair an at-risk piece descriptor (silk, antique, persian, fringe, dye) with a
// DIY action verb (bleach, hose, machine-wash, vinegar, steam-clean, scrub). Either alone is OK
// in context; the combination is what we block.

const ACTION_VERBS =
  /\b(bleach|hose|machine[- ]wash|wash\s+in\s+(?:the\s+)?(?:washer|machine)|steam[- ]clean|scrub|soak|dry[- ]clean|vinegar|baking\s+soda|hydrogen\s+peroxide|spray|iron|hot\s+water)/gi;

const AT_RISK = /\b(silk|antique|vintage|persian|tabriz|heriz|kashan|isfahan|qum|natural\s+dye|vegetable\s+dye|fringe|selvage|wool\s+&\s+silk|hand[- ]knotted)/gi;

export function isRiskyDiyAdvice(text: string): { violated: boolean; matches: string[] } {
  const actions = text.match(ACTION_VERBS) ?? [];
  const risks = text.match(AT_RISK) ?? [];
  // Only flag when BOTH appear in the same paragraph (loose proxy: same text block).
  if (actions.length === 0 || risks.length === 0) return { violated: false, matches: [] };
  return { violated: true, matches: [...new Set([...actions, ...risks])] };
}

export function routeIfRisky(text: string): { advice: string; route: "professional" | "ok" } {
  if (isRiskyDiyAdvice(text).violated) {
    return {
      advice:
        "For an antique, silk, or natural-dye piece, we'd recommend an in-showroom inspection before any cleaning. Our team can collect locally or arrange shipping.",
      route: "professional",
    };
  }
  return { advice: text, route: "ok" };
}
