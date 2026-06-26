"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { humanExitContent } from "@/lib/guardrails/human-exit";

type Msg = { role: "user" | "assistant"; content: string };

const OPENERS = [
  "Looking for something for a particular room?",
  "Curious about care for a piece you already own?",
  "Want to come in this week?",
];

/**
 * Floating concierge pill + slide-out panel. Visible on every route except /discover (where the
 * full-screen concierge already lives). Reuses /api/concierge — same orchestrator, same guardrails.
 */
export function FloatingConcierge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Don't render on /discover — the full surface already owns the conversation there.
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
      {/* Floating pill — bottom-right on every page. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open concierge"
        aria-expanded={open}
        aria-controls="concierge-panel"
        className="fixed bottom-5 right-5 lg:bottom-7 lg:right-7 z-40 inline-flex items-center gap-2.5 bg-ink text-cream pl-3 pr-5 py-3 text-sm tracking-wide-2 shadow-lg hover:bg-ink-900 transition-colors"
      >
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cream/15"
        >
          {/* simple speech-bubble glyph */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-9a8 8 0 0 1 8-8h2a8 8 0 0 1 8 6Z" />
          </svg>
        </span>
        Ask the concierge
      </button>

      {/* Backdrop + slide-in panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="concierge-title"
        >
          <button
            type="button"
            aria-label="Close concierge"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <aside
            id="concierge-panel"
            className="relative w-full sm:w-[14rem] lg:w-[16rem] h-full bg-cream border-l border-ink-300/70 flex flex-col shadow-2xl"
          >
            <header className="flex items-start justify-between px-6 py-5 border-b border-ink-300/60">
              <div>
                <p className="eyebrow">Concierge</p>
                <p id="concierge-title" className="display text-xl text-ink mt-1">
                  How can we help?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-2 -m-2 text-ink-500 hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-5" aria-live="polite">
              {history.length === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-700">
                    Tell us about the room, a piece you're drawn to, or a question about care.
                    We point to specific rugs in the collection — and never quote a price online.
                  </p>
                  <div className="flex flex-col gap-2">
                    {OPENERS.map((o) => (
                      <button
                        key={o}
                        onClick={() => send(o)}
                        className="text-left text-sm border border-ink-300/60 px-3 py-2 hover:border-ink hover:bg-cream-200/40"
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {history.map((m, i) => (
                <div key={i} className={m.role === "user" ? "ml-auto max-w-[85%]" : "max-w-[90%]"}>
                  <p className="eyebrow mb-1">{m.role === "user" ? "You" : "Concierge"}</p>
                  <p
                    className={
                      m.role === "user"
                        ? "text-sm text-ink bg-cream-200/60 px-3 py-2"
                        : "text-sm text-ink leading-relaxed"
                    }
                  >
                    {m.content}
                  </p>
                </div>
              ))}
              {pending && (
                <div className="max-w-[90%]">
                  <p className="eyebrow mb-1">Concierge</p>
                  <p className="text-sm text-ink-500 italic">Thinking…</p>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-ink-300/60 px-6 py-4 space-y-3 bg-cream"
            >
              <label htmlFor="floating-concierge-input" className="sr-only">
                Message the concierge
              </label>
              <div className="flex items-end gap-2">
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
                  placeholder="A Karabagh for a long hallway…"
                  rows={2}
                  className="flex-1 border border-ink-300 bg-cream px-3 py-2 text-sm focus:outline-none focus:border-ink resize-none"
                  disabled={pending}
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="bg-ink text-cream px-4 py-2 text-sm disabled:opacity-60 hover:bg-ink-900"
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-ink-500">
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
        </div>
      )}
    </>
  );
}
