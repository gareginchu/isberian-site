"use client";

import { useState } from "react";
import { CONSENT_TEXT } from "./ConsentLine";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "wishlist",
        contact: { email },
        transcriptSummary: "Newsletter / email-list signup from home page.",
        consent: { given: true, text: CONSENT_TEXT },
        source: "site",
      }),
    });
    setStatus(res.ok ? "ok" : "err");
    if (res.ok) setEmail("");
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="flex-1 border border-ink-300 bg-cream px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-ink text-cream px-6 py-3 text-sm tracking-wide-2 hover:bg-ink-900 disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Add me"}
      </button>
      {status === "ok" && <p className="text-xs text-ink-500 sm:basis-full">Thank you. We'll be in touch.</p>}
      {status === "err" && <p className="text-xs text-ink-500 sm:basis-full">Something went wrong. Email info@isberian.com.</p>}
    </form>
  );
}
