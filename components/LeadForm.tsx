"use client";

import { useState } from "react";
import { Button } from "./Button";
import { ConsentLine, CONSENT_TEXT } from "./ConsentLine";

type Props = {
  type: "quote" | "visit" | "wishlist" | "service" | "trade";
  rugId?: string;
  rugTitle?: string;
  heading?: string;
  blurb?: string;
};

export function LeadForm({ type, rugId, rugTitle, heading, blurb }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setStatus("submitting");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        rugId,
        contact: { name, email, phone: phone || undefined },
        transcriptSummary: rugTitle
          ? `Lead for ${rugTitle} (${rugId}). Note: ${message}`
          : message,
        consent: { given: true, text: CONSENT_TEXT },
        source: "site",
      }),
    });
    setStatus(res.ok ? "ok" : "err");
  }

  if (status === "ok") {
    return (
      <div className="border border-oxblood/40 bg-cream p-6">
        <p className="display text-2xl text-ink">Thank you.</p>
        <p className="mt-2 text-sm text-ink-700">
          A team member will be in touch shortly. If it's urgent — Chicago: 312-467-1212 · Evanston: 847-475-0000.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {heading && <p className="display text-2xl text-ink">{heading}</p>}
      {blurb && <p className="text-sm text-ink-700">{blurb}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" id="name" value={name} onChange={setName} required />
        <Field label="Email" id="email" type="email" value={email} onChange={setEmail} required />
        <Field label="Phone (optional)" id="phone" value={phone} onChange={setPhone} />
      </div>
      <div>
        <label htmlFor="msg" className="eyebrow block mb-2">
          Tell us a little
        </label>
        <textarea
          id="msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-ink-700/60 bg-transparent p-3 text-sm focus:outline-none focus:border-oxblood"
          placeholder="The room, the piece you're interested in, anything else helpful."
        />
      </div>
      <ConsentLine id="consent" checked={consent} onChange={setConsent} />
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={!consent || status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send"}
        </Button>
        {status === "err" && (
          <p className="text-sm text-oxblood">Something went wrong. Please call 312-467-1212.</p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-ink-700/60 bg-transparent p-3 text-sm focus:outline-none focus:border-oxblood"
      />
    </div>
  );
}
