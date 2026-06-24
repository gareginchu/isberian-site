import { NextResponse } from "next/server";
import { anthropic, ANTHROPIC_MODEL, cacheable } from "@/lib/ai/client";
import { TRIAGE_SYSTEM } from "@/lib/ai/prompts/triage";
import { createLead } from "@/lib/leads";

export const runtime = "nodejs";

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const note = String(form.get("note") ?? "");
  const contact = JSON.parse(String(form.get("contact") ?? "{}")) as { name?: string; email?: string; phone?: string };
  const consent = JSON.parse(String(form.get("consent") ?? "{}")) as { given?: boolean; text?: string };
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File).slice(0, MAX_PHOTOS);

  if (!contact.email || !consent.given) {
    return NextResponse.json({ error: "missing_consent_or_contact" }, { status: 422 });
  }

  const images = await Promise.all(
    photos.filter((f) => f.size <= MAX_BYTES).map(async (f) => {
      const buf = Buffer.from(await f.arrayBuffer());
      return { mediaType: f.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: buf.toString("base64") };
    }),
  );

  let result: unknown = null;
  let aiError: string | null = null;
  try {
    const client = anthropic();
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 800,
      system: [{ type: "text", text: TRIAGE_SYSTEM, ...cacheable }],
      messages: [
        {
          role: "user",
          content: [
            ...images.map((img) => ({
              type: "image" as const,
              source: { type: "base64" as const, media_type: img.mediaType, data: img.data },
            })),
            { type: "text" as const, text: `Note from the owner:\n${note || "(no note provided)"}` },
          ],
        },
      ],
    });
    const text = response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("\n");
    try {
      result = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, ""));
    } catch {
      result = { note: text };
    }
  } catch (err) {
    aiError = err instanceof Error ? err.message : "vision_error";
    console.error("[triage] vision call failed", err);
  }

  const transcriptSummary =
    `Triage. Note: ${note}\nAI impression: ${aiError ? `(vision unavailable: ${aiError})` : JSON.stringify(result).slice(0, 1500)}`.slice(0, 1900);

  try {
    await createLead({
      type: "service",
      contact: { name: contact.name, email: contact.email!, phone: contact.phone },
      transcriptSummary,
      consent: { given: true, text: consent.text || "I'd like to be contacted about my inquiry." },
      source: "triage",
    });
  } catch (err) {
    console.error("[triage] createLead unexpectedly threw", err);
  }

  return NextResponse.json({ ok: true, result, aiError });
}
