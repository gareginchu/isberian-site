import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, ANTHROPIC_MODEL, cacheable } from "./client";
import { CONCIERGE_SYSTEM } from "./prompts/concierge";
import { tools, type ToolName } from "./tools";
import { searchInventory } from "@/lib/search";
import { answerFaq } from "@/lib/faq";
import { findSimilar } from "@/lib/catalog";
import { bookAppointment } from "@/lib/booking";
import { createLead } from "@/lib/leads";
import { scanAssistantText, requireKnownRugIds } from "@/lib/guardrails";

export type ConciergeMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export type ConciergeResult = {
  reply: string;
  citedRugIds: string[];
  toolCalls: { name: ToolName; ok: boolean; ms: number }[];
  guardrailFindings: ReturnType<typeof scanAssistantText>;
  handedOffToHuman: boolean;
};

const MAX_TURNS = 6; // hard cap on tool-loop iterations per request

/**
 * One concierge turn. Drives a Claude tool-use loop until the model returns text without a
 * tool_use block, applies guardrails to the final text, and returns a structured result.
 *
 * Prompt caching: the system prompt and tool list are marked cacheable on every call so warm
 * traffic gets prefix hits. The history is appended after the cache breakpoint.
 */
export async function runConcierge(history: ConciergeMessage[]): Promise<ConciergeResult> {
  const client = anthropic();

  const messages: Anthropic.Messages.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const toolCalls: ConciergeResult["toolCalls"] = [];
  const citedRugIds: string[] = [];
  const allowedRugIds = new Set<string>();
  let handedOffToHuman = false;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    let response: Anthropic.Messages.Message;
    try {
      response = await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: CONCIERGE_SYSTEM,
            ...cacheable,
          },
        ],
        tools: tools.map((t, i, arr) => (i === arr.length - 1 ? { ...t, ...cacheable } : t)),
        messages,
      });
    } catch {
      handedOffToHuman = true;
      return {
        reply:
          "I'm not finding a clean answer right now — the team at the showroom would be much faster on this. Chicago is 312-467-1212, Evanston is 847-475-0000.",
        citedRugIds: [],
        toolCalls,
        guardrailFindings: [],
        handedOffToHuman,
      };
    }

    // Push the assistant turn (whatever shape) before deciding what to do next.
    messages.push({ role: "assistant", content: response.content });

    const toolUses = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );

    if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
      const textBlocks = response.content.filter(
        (b): b is Anthropic.Messages.TextBlock => b.type === "text",
      );
      const reply = textBlocks.map((b) => b.text).join("\n").trim();

      // Catch fabricated rug ids before they reach the user.
      try {
        requireKnownRugIds(citedRugIds, Array.from(allowedRugIds));
      } catch {
        handedOffToHuman = true;
        return {
          reply:
            "Let me hand you to a person — I want to be precise about specific pieces, and the showroom can pull exact records right now. Chicago: 312-467-1212. Evanston: 847-475-0000.",
          citedRugIds: [],
          toolCalls,
          guardrailFindings: [],
          handedOffToHuman,
        };
      }

      const guardrailFindings = scanAssistantText(reply, { rugIdsInScope: Array.from(allowedRugIds) });
      if (guardrailFindings.some((f) => f.severity === "block")) {
        handedOffToHuman = true;
        return {
          reply:
            "I can help with pieces, care, and showroom visits — but pricing we handle in person. Would you like me to hold a time, or save this to a wishlist? Chicago 312-467-1212, Evanston 847-475-0000.",
          citedRugIds,
          toolCalls,
          guardrailFindings,
          handedOffToHuman,
        };
      }

      return { reply, citedRugIds, toolCalls, guardrailFindings, handedOffToHuman };
    }

    // Run each tool call, collect tool_result blocks for the next turn.
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      const start = Date.now();
      let ok = true;
      let resultText = "";
      try {
        switch (use.name as ToolName) {
          case "search_inventory": {
            const args = use.input as { query: string; filters?: Record<string, unknown>; limit?: number };
            const hits = await searchInventory(args.query, args.filters, args.limit ?? 6);
            for (const h of hits) allowedRugIds.add(h.id);
            resultText = JSON.stringify(hits);
            break;
          }
          case "answer_faq": {
            const args = use.input as { query: string; category?: string };
            const ans = await answerFaq(args.query, args.category);
            resultText = JSON.stringify(ans);
            break;
          }
          case "find_similar": {
            const args = use.input as { rugId: string; limit?: number };
            const hits = await findSimilar(args.rugId, args.limit ?? 4);
            for (const h of hits) allowedRugIds.add(h.id);
            resultText = JSON.stringify(hits);
            break;
          }
          case "book_appointment": {
            const args = use.input as Parameters<typeof bookAppointment>[0];
            const res = await bookAppointment(args);
            resultText = JSON.stringify(res);
            break;
          }
          case "create_lead": {
            const args = use.input as Parameters<typeof createLead>[0];
            const res = await createLead(args);
            resultText = JSON.stringify(res);
            break;
          }
          default:
            ok = false;
            resultText = JSON.stringify({ error: `Unknown tool: ${use.name}` });
        }
      } catch (err) {
        ok = false;
        resultText = JSON.stringify({ error: err instanceof Error ? err.message : "tool_error" });
      }
      toolCalls.push({ name: use.name as ToolName, ok, ms: Date.now() - start });
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: resultText,
        is_error: !ok,
      });

      // Track which rug ids the model is citing in arguments (book/wishlist/find_similar).
      if ("rugId" in (use.input as Record<string, unknown>)) {
        const id = (use.input as { rugId?: string }).rugId;
        if (id) citedRugIds.push(id);
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  // Hit the loop cap without resolving — hand off to a human.
  handedOffToHuman = true;
  return {
    reply:
      "Let me hand you to a person on this — we'll get to a clean answer faster in the showroom. Chicago: 312-467-1212. Evanston: 847-475-0000.",
    citedRugIds,
    toolCalls,
    guardrailFindings: [],
    handedOffToHuman,
  };
}
