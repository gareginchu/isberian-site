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
 * Persistent Ask surface — always visible at the bottom of every page.
 *   - Collapsed (default): a fixed pill input anchored bottom-right with placeholder
 *     "Ask anything…". It never scrolls away.
 *   - Expanded: same pill grows into a fin.ai-style card with conversation bubbles
 *     above. Clicking the pill, focusing the input, or typing opens the card.
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

  // Concierge is now the floating bottom-right pill everywhere; the previous
  // dedicated /discover route has been removed and the home-page hero pill
  // exclusion lifted so this is the single entry point on every page.
  const hideOnRoute = false;
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
    if (!open) setOpen(true);
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
    <aside
      id="concierge-card"
      role="dialog"
      aria-labelledby="concierge-title"
      className={`fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-40 flex flex-col bg-cream shadow-[0_12px_40px_-12px_rgba(20,20,18,0.18)] ring-1 ring-ink/10 transition-all duration-200 ${
        open
          ? "w-[min(360px,calc(100vw-2rem))] max-h-[min(580px,calc(100dvh-2.5rem))] rounded-3xl"
          : "w-[min(280px,calc(100vw-2rem))] rounded-full"
      }`}
    >
      <h2 id="concierge-title" className="sr-only">
        Concierge
      </h2>

      {/* Quiet dismiss in the top-right; only visible when expanded. */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Collapse concierge"
          className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Conversation region — only rendered when there is history. */}
      {open && !isIdle && (
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

      {/* Idle expanded state — chip floats above the input, both vertically centered. */}
      {open && isIdle && (
        <div className="flex-1 flex flex-col justify-end pt-12" aria-hidden={false} />
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className={open ? "px-5 pb-5 pt-3" : "p-1.5"}
      >
        {/* Single rotating suggestion chip — only when expanded and idle. */}
        {open && isIdle && (
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
          Ask the concierge
        </label>
        <div
          className={`flex items-center gap-1.5 bg-white rounded-full ${
            open ? "pl-5 pr-1.5 h-[52px] ring-1 ring-ink/10" : "pl-5 pr-1.5 h-[48px] ring-1 ring-ink/10"
          } focus-within:ring-ink/25 transition-shadow`}
        >
          {/* Subtle chat glyph as visual anchor when collapsed — replaces the old launcher. */}
          {!open && (
            <svg className="w-4 h-4 text-ink/40 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          )}
          <textarea
            id="floating-concierge-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask anything · 24/7"
            rows={1}
            aria-expanded={open}
            className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink/40 focus:outline-none resize-none leading-[20px] py-[6px] max-h-24"
            disabled={pending}
          />
          {open && (
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
          )}
          {/* Arrow doubles as expand-when-empty so the pill always feels active.
              When the input is empty, clicking opens the concierge in place
              instead of triggering a no-op submit. When there's text, normal
              submit fires. Avoids the grayed-out "dead" appearance visitors
              flagged. */}
          <button
            type={input.trim() ? "submit" : "button"}
            disabled={pending}
            onClick={() => {
              if (!input.trim()) {
                setOpen(true);
                inputRef.current?.focus();
              }
            }}
            aria-label={input.trim() ? "Send" : "Open concierge"}
            className={`inline-flex items-center justify-center rounded-full transition-colors ${
              open
                ? "w-10 h-10 bg-ink text-cream disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ink-900"
                : "w-9 h-9 bg-ink text-cream disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-900"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>

        {open && (
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
        )}
      </form>
    </aside>
  );
}
