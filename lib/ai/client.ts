import Anthropic from "@anthropic-ai/sdk";

/**
 * Single Anthropic client instance. Reused across the concierge, enrich queue, triage, and identify
 * flows so connection pooling and prompt-cache hits work across requests.
 *
 * Model pinned to `claude-sonnet-4-6` (per CLAUDE.md) for orchestration + vision. Override per call
 * only when there's a specific reason.
 */
export const ANTHROPIC_MODEL = "claude-sonnet-4-6" as const;

let _client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local before invoking any AI surface.",
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

/**
 * Wrap a content block with prompt-cache metadata. Anthropic caches the prefix up to and including
 * the marker for 5 minutes (ephemeral), so we place markers at:
 *   - end of system prompt (the long, stable voice + rules block)
 *   - end of tool definitions
 *   - end of any large grounding context (e.g. retrieved FAQ entries)
 *
 * Cache hits dramatically reduce both latency and cost on a concierge that re-uses the same prompt
 * shell across turns. See /lib/ai/orchestrator.ts for usage.
 */
export const cacheable = { cache_control: { type: "ephemeral" as const } };
