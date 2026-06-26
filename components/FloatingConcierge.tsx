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
 * Floating concierge — Intercom/Fin-style messenger.
 *   - 60px circular launcher in the bottom-right corner.
 *   - Click opens a compact card (~380x580) anchored to the same corner.
 *   - Non-modal: the page underneath stays interactive.
 * Hidden on /discover where the full-screen concierge already owns the conversation.
 */
export function FloatingConcierge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hideOnRoute = pathname === "/discover";

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
          className="fixed bottom-5 right-5 lg:bottom-6 lg:right-6 z-40 inline-flex items-center justify-center w-[60px] h-[60px] rounded-full bg-ink text-cream shadow-lg hover:bg-ink-900 transition-transform hover:scale-[1.04]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}

      {/* Floating card — fin.ai/Intercom pattern: bottom-right anchored, non-modal. */}
      {open && (
        <aside
          id="concierge-card"
          role="dialog"
          aria-labelledby="concierge-title"
          className="fixed bottom-5 right-5 lg:bottom-6 lg:right-6 z-40 flex flex-col w-[calc(100vw-2.5rem)] sm:w-[380px] h-[min(580px,calc(100dvh-2.5rem))] bg-white rounded-2xl shadow-2xl border border-ink-300/30 overflow-hidden"
        >
          {/* Header — gentle gradient, avatar dot, greeting, close. */}
          <header className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-cream via-white to-cream-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span aria-hidden className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink text-cream text-[13px] font-medium">
                  OI
                </span>
                <div>
                  <p id="concierge-title" className="text-[15px] font-medium text-ink leading-tight">
                    Hi there
                  </p>
                  <p className="text-[12.5px] text-ink-500 leading-tight mt-0.5">
                    How can we help you today?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1.5 -m-1.5 text-ink-500 hover:text-ink rounded-full hover:bg-ink/5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </header>

          {/* Conversation + starter chips */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4" aria-live="polite">
            {history.length === 0 && (
              <div className="space-y-3">
                <p className="text-[13px] text-ink-700 leading-relaxed">
                  Tell us about the room, a piece you're drawn to, or a question about care.
                </p>
                <div className="flex flex-col gap-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-[13px] text-ink bg-cream-200/50 hover:bg-cream-200 px-3.5 py-2.5 rounded-xl border border-ink-300/40 hover:border-ink-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <p
                  className={
                    m.role === "user"
                      ? "max-w-[80%] text-[13px] text-cream bg-ink px-3.5 py-2.5 rounded-2xl rounded-br-md"
                      : "max-w-[85%] text-[13px] text-ink bg-cream-200/60 px-3.5 py-2.5 rounded-2xl rounded-bl-md leading-relaxed"
                  }
                >
                  {m.content}
                </p>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <span className="inline-flex items-center gap-1 text-ink-500 bg-cream-200/60 px-3.5 py-2.5 rounded-2xl rounded-bl-md" aria-label="Concierge is typing">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-500/70 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-500/70 animate-pulse [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-500/70 animate-pulse [animation-delay:240ms]" />
                </span>
              </div>
            )}
          </div>

          {/* Input — pill-shaped, integrated send button. */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="px-4 pb-4 pt-2"
          >
            <label htmlFor="floating-concierge-input" className="sr-only">
              Message the concierge
            </label>
            <div className="flex items-center gap-2 bg-cream-200/40 border border-ink-300/40 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-ink-300 focus-within:bg-white transition-colors">
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
                className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-500 focus:outline-none resize-none max-h-24 py-1.5"
                disabled={pending}
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink text-cream disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-900 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="mt-2.5 text-[11px] text-ink-500 text-center">
              Prefer a person?{" "}
              <a href={humanExitContent.chicago.phoneHref} className="text-ink hover:underline">
                {humanExitContent.chicago.phone}
              </a>
              {" · "}
              <a href={humanExitContent.evanston.phoneHref} className="text-ink hover:underline">
                {humanExitContent.evanston.phone}
              </a>
              {" · "}
              <Link href="/visit" className="text-ink hover:underline" onClick={() => setOpen(false)}>
                book a visit
              </Link>
            </p>
          </form>
        </aside>
      )}
    </>
  );
}
