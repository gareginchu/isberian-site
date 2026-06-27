"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Inline concierge surface on the homepage — Perplexity/SearchGPT pattern but
 * in the house voice. Big pill input as the centerpiece; rotating example
 * prompts below; submit navigates to /discover with the query pre-loaded.
 *
 * The intent: AI is the front door, not a corner widget. A visitor asks a
 * question right where they land. The full conversation runs at /discover.
 */
const STARTERS = [
  "I'm looking for a runner for a long hallway",
  "Show me something for a master bedroom",
  "What's an antique Heriz like?",
  "How do I care for a silk piece?",
];

export function HomeConcierge() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [chipIndex, setChipIndex] = useState(0);

  // Rotate the example prompt every 3.5s.
  useEffect(() => {
    const id = window.setInterval(() => {
      setChipIndex((i) => (i + 1) % STARTERS.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  function submit(text: string) {
    if (!text.trim()) return;
    router.push(`/discover?q=${encodeURIComponent(text.trim())}`);
  }

  return (
    <section className="bg-cream-200/40 border-y border-ink-300/40">
      <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24 text-center space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] tracking-wide-3 uppercase text-ink-500">
            Tell us what you&apos;re looking for
          </p>
          <h2 className="display text-3xl lg:text-4xl text-ink leading-tight">
            Talk to us. We know the floor.
          </h2>
          <p className="text-base text-ink-700 max-w-xl mx-auto leading-relaxed">
            Tell us about the room, a piece you&apos;re drawn to, or a question
            about care. Our concierge points to specific rugs in the
            collection — and never quotes a price online.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={STARTERS[chipIndex]}
              aria-label="Ask the concierge"
              className="w-full bg-white border border-ink-300 rounded-full pl-6 pr-16 py-4 text-base text-ink placeholder:text-ink-500/70 focus:outline-none focus:border-ink transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Ask"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink text-cream disabled:opacity-40 hover:bg-ink-900 transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="text-xs text-ink-700 bg-cream border border-ink-300/60 hover:border-ink hover:text-ink rounded-full px-3.5 py-1.5 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </form>

        <p className="text-xs text-ink-500 pt-2">
          Prefer a person?{" "}
          <a href="tel:+13124671212" className="hover:text-ink">
            Chicago 312-467-1212
          </a>{" "}
          ·{" "}
          <a href="tel:+18474750000" className="hover:text-ink">
            Evanston 847-475-0000
          </a>{" "}
          ·{" "}
          <Link href="/visit" className="hover:text-ink">
            book a visit
          </Link>
        </p>
      </div>
    </section>
  );
}
