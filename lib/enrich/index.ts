import type { Rug, RugDescription } from "@/lib/types/rug";
import { anthropic, ANTHROPIC_MODEL, cacheable } from "@/lib/ai/client";
import { ENRICH_SYSTEM } from "@/lib/ai/prompts/enrich";
import { scanAssistantText } from "@/lib/guardrails";

/**
 * AI-assisted drafting of the structured RugDescription block from raw attributes + image URLs.
 * Returns the draft + the editor-queue verdict; the queue (out of scope for v1 storage) is the
 * gate before publish. Any unverified field stays `verified: false` and is visibly flagged on the
 * rug page.
 */
export type EnrichInput = {
  rugId: string;
  attributes: Partial<Rug["description"]["details"]> & {
    origin?: string;
    region?: string;
  };
  imageUrls: string[];
};

export type EnrichDraft = {
  rugId: string;
  draft: RugDescription;
  guardrailFindings: ReturnType<typeof scanAssistantText>;
  editorQueueStatus: "needs-review" | "auto-block";
};

export async function draftDescription(input: EnrichInput): Promise<EnrichDraft> {
  const client = anthropic();
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: [{ type: "text", text: ENRICH_SYSTEM, ...cacheable }],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              `Attributes:\n${JSON.stringify(input.attributes, null, 2)}\n\nImages: ${input.imageUrls.length} provided.\n\nReturn the RugDescription JSON only.`,
          },
        ],
      },
    ],
  });
  const text = response.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("\n");
  let draft: RugDescription;
  try {
    draft = JSON.parse(stripCodeFence(text)) as RugDescription;
  } catch {
    return {
      rugId: input.rugId,
      draft: blankDescription(),
      guardrailFindings: [
        { rule: "inventory", severity: "block", message: "Draft did not parse as JSON; queued for editor." },
      ],
      editorQueueStatus: "auto-block",
    };
  }
  const findings = scanAssistantText(JSON.stringify(draft));
  return {
    rugId: input.rugId,
    draft,
    guardrailFindings: findings,
    editorQueueStatus: findings.some((f) => f.severity === "block") ? "auto-block" : "needs-review",
  };
}

function stripCodeFence(s: string) {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function blankDescription(): RugDescription {
  return {
    lead: "",
    details: { sizeImperial: "", sizeMetric: "", technique: "Hand-knotted", materials: ["Wool"], pile: "Medium" },
    colorPalette: [],
    designFeatures: [],
    distinguishing: [],
    provenance: { origin: "Unspecified", verified: false },
  };
}
