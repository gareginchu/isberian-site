// Rule 2: No fabricated inventory. Only real catalog records; always link the real rug page.
//
// Structural check: the orchestrator passes the rug ids the model was allowed to cite (from
// `search_inventory` tool results). Any rug id, slug, or title the model surfaces that's not in
// the allowed set is fabrication.

export function hasFabricatedInventory(args: {
  citedRugIds: string[];
  allowedRugIds: string[];
}): { violated: boolean; offending: string[] } {
  const allowed = new Set(args.allowedRugIds);
  const offending = args.citedRugIds.filter((id) => !allowed.has(id));
  return { violated: offending.length > 0, offending };
}

/**
 * Pre-flight assertion before sending a response that names rugs. Throws if any cited id is not
 * grounded in tool results. Callers should catch and fall back to a human-handoff message.
 */
export function requireKnownRugIds(citedRugIds: string[], allowedRugIds: string[]): void {
  const check = hasFabricatedInventory({ citedRugIds, allowedRugIds });
  if (check.violated) {
    throw new Error(
      `Guardrail (inventory): assistant referenced rug ids not present in retrieved results: ${check.offending.join(", ")}`,
    );
  }
}
