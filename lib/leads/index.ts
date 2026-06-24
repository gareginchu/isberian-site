import type { Lead, LeadType } from "@/lib/types/lead";
import { webcrypto } from "node:crypto";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  preferredContact: z.enum(["email", "phone"]).optional(),
});

const ConsentSchema = z.object({
  given: z.literal(true),
  at: z.string().datetime().optional(),
  text: z.string().min(8),
});

export const LeadInputSchema = z.object({
  type: z.enum(["quote", "visit", "wishlist", "service", "identify", "trade", "concierge"]),
  contact: ContactSchema,
  rugId: z.string().optional(),
  transcript: z.string().max(20000).optional(),
  transcriptSummary: z.string().max(2000).optional(),
  attachments: z
    .array(
      z.object({
        kind: z.enum(["photo", "transcript"]),
        url: z.string().url().optional(),
        inline: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .max(8)
    .optional(),
  consent: ConsentSchema,
  source: z.enum(["site", "concierge", "triage", "identify"]).default("site"),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;

/**
 * Consent-gated lead sink. In v1: POSTs to `LEAD_WEBHOOK_URL` (HubSpot) when set, otherwise logs.
 * Email fallback is plumbed but not invoked here (Postmark / Resend wiring is its own commit).
 *
 * Returns the lead id on success. Never throws to the caller — the user-facing flow must complete
 * even when the CRM is down; lost-lead replay belongs in /scripts.
 */
export async function createLead(input: LeadInput): Promise<{ ok: boolean; id: string }> {
  const parsed = LeadInputSchema.parse(input);
  const lead: Lead = {
    id: cryptoRandomId(),
    type: parsed.type as LeadType,
    createdAt: new Date().toISOString(),
    contact: parsed.contact,
    rugId: parsed.rugId,
    transcript: parsed.transcript ?? parsed.transcriptSummary,
    attachments: parsed.attachments,
    consent: {
      given: parsed.consent.given,
      at: parsed.consent.at ?? new Date().toISOString(),
      text: parsed.consent.text,
    },
    source: parsed.source,
  };
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    console.info("[lead] no LEAD_WEBHOOK_URL set; logging only", { id: lead.id, type: lead.type });
    return { ok: true, id: lead.id };
  }
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    return { ok: res.ok, id: lead.id };
  } catch (err) {
    console.error("[lead] webhook failed", err);
    return { ok: false, id: lead.id };
  }
}

function cryptoRandomId() {
  // Crypto-strong id, prefixed for log readability.
  const bytes = new Uint8Array(8);
  (globalThis.crypto ?? webcrypto).getRandomValues(bytes);
  return "lead_" + Buffer.from(bytes).toString("hex");
}
