"use client";

import { useState } from "react";
import { Button } from "./Button";
import { ConsentLine, CONSENT_TEXT } from "./ConsentLine";
import { humanExitContent } from "@/lib/guardrails/human-exit";

type TriageMode = "service" | "identify";

const COPY: Record<TriageMode, { heading: string; blurb: string; cta: string }> = {
  service: {
    heading: "Service triage",
    blurb:
      "Send a few photos and a short note about what you're noticing. Our team will review and reach out with a path — a drop-off, a house call, or a showroom inspection. We don't suggest household cleaning for valuable pieces; that's how dyes and pile get permanently damaged.",
    cta: "Submit for triage",
  },
  identify: {
    heading: "Identify a rug",
    blurb:
      "Send photos of the front, the back, and a corner showing the fringe and selvage. We'll share a preliminary impression of origin, age band, and type. Identification on photos is preliminary — anything definitive happens in person.",
    cta: "Submit for identification",
  },
};

export function PhotoTriage({ mode }: { mode: TriageMode }) {
  const copy = COPY[mode];
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">("idle");
  const [result, setResult] = useState<unknown>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setStatus("submitting");
    const body = new FormData();
    body.append("mode", mode);
    body.append("note", note);
    body.append("contact", JSON.stringify(contact));
    body.append("consent", JSON.stringify({ given: true, text: CONSENT_TEXT }));
    files.forEach((f) => body.append("photos", f));
    try {
      const res = await fetch(mode === "service" ? "/api/triage" : "/api/identify", {
        method: "POST",
        body,
      });
      const data = await res.json();
      setResult(data);
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  }

  if (status === "ok") {
    const impression = readImpression(result);
    return (
      <div className="space-y-5">
        <div className="border border-oxblood/40 bg-cream p-6">
          <p className="display text-2xl text-ink">Thank you — we have your photos.</p>
          <p className="mt-2 text-sm text-ink-700">
            A specialist will be in touch within one business day. If it's urgent, please call{" "}
            <a href={humanExitContent.chicago.phoneHref} className="text-oxblood">
              {humanExitContent.chicago.phone}
            </a>
            .
          </p>
          {impression ? (
            <details className="mt-5">
              <summary className="eyebrow cursor-pointer">Preliminary impression</summary>
              <div className="mt-3 text-sm text-ink-700 whitespace-pre-line leading-relaxed">
                {impression}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="display text-3xl text-ink">{copy.heading}</p>
        <p className="mt-3 text-sm text-ink-700 max-w-2xl">{copy.blurb}</p>
      </div>
      <div>
        <label htmlFor="photos" className="eyebrow block mb-2">
          Photos
        </label>
        <input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block text-sm text-ink-700"
        />
        {files.length > 0 && (
          <p className="mt-2 text-xs text-ink-500">{files.length} photo(s) attached.</p>
        )}
      </div>
      <div>
        <label htmlFor="note" className="eyebrow block mb-2">
          Note
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full border border-ink-700/60 bg-transparent p-3 text-sm focus:outline-none focus:border-oxblood"
          placeholder={
            mode === "service"
              ? "What are you noticing? Where is it on the rug? Any history with the piece?"
              : "Anything you already know — where it came from, how long you've had it, anything inherited."
          }
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field id="t-name" label="Name" value={contact.name} onChange={(v) => setContact((c) => ({ ...c, name: v }))} required />
        <Field id="t-email" label="Email" type="email" value={contact.email} onChange={(v) => setContact((c) => ({ ...c, email: v }))} required />
        <Field id="t-phone" label="Phone (optional)" value={contact.phone} onChange={(v) => setContact((c) => ({ ...c, phone: v }))} />
      </div>
      <ConsentLine id={`consent-${mode}`} checked={consent} onChange={setConsent} />
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={!consent || status === "submitting"}>
          {status === "submitting" ? "Sending…" : copy.cta}
        </Button>
        {status === "err" && (
          <p className="text-sm text-oxblood">
            Something went wrong. Please call{" "}
            <a href={humanExitContent.chicago.phoneHref} className="text-oxblood underline">
              {humanExitContent.chicago.phone}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}

// Turn the API response into a readable text impression. The vision call may return
// either a JSON object with structured fields (origin, age, type, …) or a free-text
// note. Either way, render plain prose, not raw JSON.
function readImpression(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const r = payload as Record<string, unknown>;
  const inner = "result" in r ? r.result : r;
  if (!inner) return "";
  if (typeof inner === "string") return inner;
  if (typeof inner !== "object") return String(inner);
  const obj = inner as Record<string, unknown>;
  if (typeof obj.note === "string") return obj.note;
  return Object.entries(obj)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${labelize(k)}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join("\n\n");
}

function labelize(key: string): string {
  return key.replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());
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
