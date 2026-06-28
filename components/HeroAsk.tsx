"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * AI front door rooted in the hero carousel. Collapsed: a single "Ask anything"
 * pill anchored over the imagery. Expanded: a concierge card (input + suggestion
 * chips) takes over the lower half of the hero with a subtle backdrop dim so
 * the carousel reads as context. Submit navigates to /discover.
 *
 * Lives inside HeroCarousel as overlay children. Renders on top of the indicator
 * dots, so the dots are pushed up via padding when this is present.
 */
const STARTERS = [
  "I'm looking for a runner for a long hallway",
  "Show me something for a master bedroom",
  "What's an antique Heriz like?",
  "How do I care for a silk piece?",
];

export function HeroAsk() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chipIndex, setChipIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setChipIndex((i) => (i + 1) % STARTERS.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(text: string) {
    if (!text.trim()) return;
    router.push(`/discover?q=${encodeURIComponent(text.trim())}`);
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Click-outside-to-close target. No backdrop dim — the page should stay
          visible behind the panel. The panel itself is narrow and right-anchored. */}
      <button
        type="button"
        aria-label="Close concierge"
        onClick={() => setOpen(false)}
        className={`absolute inset-0 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        tabIndex={open ? 0 : -1}
      />

      {/* Collapsed pill — bottom-center of the carousel, above the dots. */}
      {!open && (
        <div className="absolute bottom-16 lg:bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            aria-controls="hero-ask-panel"
            className="group inline-flex items-center gap-3 bg-cream/95 backdrop-blur-sm text-ink rounded-full pl-6 pr-2 py-2 shadow-[0_8px_28px_-8px_rgba(20,20,18,0.45)] ring-1 ring-ink/10 hover:bg-cream transition-colors"
          >
            <span className="text-sm lg:text-base font-medium tracking-wide">Ask anything · 24/7</span>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink text-cream group-hover:bg-ink-900 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </span>
          </button>
        </div>
      )}

      {/* Expanded panel — narrow column anchored bottom-right so the carousel
          remains visible beside it. Mobile: nearly full width. */}
      {open && (
        <div
          id="hero-ask-panel"
          role="dialog"
          aria-labelledby="hero-ask-title"
          className="absolute right-4 bottom-6 left-4 lg:left-auto lg:right-8 lg:bottom-10 lg:w-[380px] pointer-events-auto"
        >
          <div className="bg-cream rounded-3xl shadow-[0_20px_60px_-16px_rgba(20,20,18,0.5)] ring-1 ring-ink/10 p-6 lg:p-8 relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-full text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 id="hero-ask-title" className="display text-2xl lg:text-3xl text-ink leading-tight pr-8">
              Talk to us. We know the floor.
            </h2>
            <p className="mt-2 text-sm text-ink-700 max-w-md leading-relaxed">
              Tell us about the room, a piece you&apos;re drawn to, or a question about care.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="mt-5 space-y-3"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={STARTERS[chipIndex]}
                  aria-label="Ask the concierge"
                  className="w-full bg-white border border-ink-300 rounded-full pl-5 pr-14 py-3.5 text-base text-ink placeholder:text-ink-500/70 focus:outline-none focus:border-ink transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Ask"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink text-cream disabled:opacity-40 hover:bg-ink-900 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="text-xs text-ink-700 bg-cream-200 border border-ink-300/60 hover:border-ink hover:text-ink rounded-full px-3 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
