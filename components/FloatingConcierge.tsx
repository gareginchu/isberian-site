"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { humanExitContent } from "@/lib/guardrails/human-exit";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "I'm looking for something for a particular room",
  "I want to ask about care for a piece I own",
  "I'd like to come into the showroom",
];

/**
 * Floating concierge — fin.ai-style chat surface.
 *   - 60px circular launcher in the bottom-right corner (unchanged).
 *   - Click opens a soft cream card with a single pill input as the centerpiece.
 *   - Idle: a single floating suggestion chip sits above the pill, rotating through STARTERS.
 *   - Active: conversation bubbles render above the pill; the suggestion chip retires.
 * Hidden on /discover where the full-screen concierge already owns the conversation.
 */
export function FloatingConcierge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [chipIndex, setChipIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hideOnRoute = pathname === "/discover";
  const isIdle = history.length === 0 && !pending;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, pending]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Rotate the single suggestion chip through STARTERS while the conversation is idle.
  useEffect(() => {
    if (!open || !isIdle) return;
    const id = window.setInterval(() => {
      setChipIndex((i) => (i + 1) % STARTERS.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [open, isIdle]);

  async function send(text: string) {
    if (!text.trim() || pending) return;
    const next: Msg[] = [...history, { role: "user", content: text }];
    setHistory(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: next }),
      });
      const data = (await res.json()) as { reply: string };
      setHistory([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setHistory([
        ...next,
        {
          role: "assistant",
          content:
            "I'm not finding a clean answer right now — the team at the showroom would be much faster. Chicago: 312-467-1212. Evanston: 847-475-0000.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  if (hideOnRoute) return null;

  return (
    <>
      {/* 60px round launcher, ink fill, cream chat glyph. Hidden when card is open. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open concierge"
          aria-expanded={open}
          aria-controls="concierge-card"
          className="fixed bottom-5 right-5 lg:bottom-6 lg:right-6 z-40 inline-flex items-center justify-center w-12 h-12 lg:w-[60px] lg:h-[60px] rounded-full bg-ink text-cream shadow-lg hover:bg-ink-900 transition-transform hover:scale-[1.04]"
        >
          <svg className="w-[22px] h-[22px] lg:w-[26px] lg:h-[26px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}

      {/* fin.ai-style chat surface — soft cream, one pill input as the centerpiece. */}
      {open && (
        <aside
          id="concierge-card"
          role="dialog"
          aria-labelledby="concierge-title"
          className="fixed bottom-5 right-5 lg:bottom-6 lg:right-6 z-40 flex flex-col w-[calc(100vw-2.5rem)] sm:w-[400px] max-h-[min(620px,calc(100dvh-2.5rem))] bg-cream rounded-3xl shadow-[0_12px_40px_-12px_rgba(20,20,18,0.18)] ring-1 ring-ink/5 relative"
        >
          <h2 id="concierge-title" className="sr-only">
            Concierge
          </h2>

          {/* Quiet dismiss in the top-right; no header bar. */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>

          {/* Conversation region — grows when there is history, otherwise just breathes. */}
          {!isIdle && (
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 pt-12 pb-2 space-y-3"
              aria-live="polite"
            >
              {history.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <p
                    className={
                      m.role === "user"
                        ? "max-w-[80%] text-[13px] text-cream bg-ink px-3.5 py-2.5 rounded-2xl rounded-br-md"
                        : "max-w-[85%] text-[13px] text-ink bg-white/70 px-3.5 py-2.5 rounded-2xl rounded-bl-md leading-relaxed"
                    }
                  >
                    {m.content}
                  </p>
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <span
                    className="inline-flex items-center gap-1 text-ink-500 bg-white/70 px-3.5 py-2.5 rounded-2xl rounded-bl-md"
                    aria-label="Concierge is typing"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-500/70 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-500/70 animate-pulse [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-500/70 animate-pulse [animation-delay:240ms]" />
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Idle empty state — chip floats above the input, both vertically centered. */}
          {isIdle && (
            <div className="flex-1 flex flex-col justify-end pt-12" aria-hidden={false} />
          )}

          {/* Input area — floating chip + pill input + microcopy. */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="px-5 pb-5 pt-3"
          >
            {/* Single rotating suggestion chip, semi-transparent, floats above the pill. */}
            {isIdle && (
              <div className="flex justify-center mb-3">
                <button
                  type="button"
                  onClick={() => send(STARTERS[chipIndex])}
                  className="max-w-full text-[12.5px] text-ink/80 bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:text-ink px-3.5 py-2 rounded-full ring-1 ring-ink/10 transition-colors truncate"
                >
                  {STARTERS[chipIndex]}
                </button>
              </div>
            )}

            <label htmlFor="floating-concierge-input" className="sr-only">
              Message the concierge
            </label>
            <div className="flex items-center gap-1.5 bg-white rounded-full pl-5 pr-1.5 h-[52px] ring-1 ring-ink/10 focus-within:ring-ink/25 transition-shadow">
              <textarea
                id="floating-concierge-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask anything…"
                rows={1}
                className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink/40 focus:outline-none resize-none leading-[20px] py-[6px] max-h-24"
                disabled={pending}
              />
              {/* Inline "more" affordance — visual parity with fin.ai's ··· icon. */}
              <button
                type="button"
                aria-label="More options"
                tabIndex={-1}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <circle cx="5" cy="12" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="19" cy="12" r="1.6" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-300/40 text-ink disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ink-300/70 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-[11px] text-ink/50 text-center">
              Prefer a person?{" "}
              <a href={humanExitContent.chicago.phoneHref} className="text-ink/70 hover:text-ink hover:underline">
                {humanExitContent.chicago.phone}
              </a>
              {" · "}
              <a href={humanExitContent.evanston.phoneHref} className="text-ink/70 hover:text-ink hover:underline">
                {humanExitContent.evanston.phone}
              </a>
              {" · "}
              <Link
                href="/visit"
                className="text-ink/70 hover:text-ink hover:underline"
                onClick={() => setOpen(false)}
              >
                book a visit
              </Link>
            </p>
          </form>
        </aside>
      )}
    </>
  );
}
