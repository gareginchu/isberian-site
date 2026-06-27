"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { humanExitContent } from "@/lib/guardrails/human-exit";

type Msg = { role: "user" | "assistant"; content: string };

const OPENERS = [
  "Looking for something for a particular room?",
  "Curious about care for a piece you already own?",
  "Want to come in this week?",
];

/** Read `?q=...` from the URL inside a Suspense boundary so Next.js doesn't
 * bail static rendering of /discover. Returns null if no query is present. */
function useInitialQuery(): string | null {
  try {
    const params = useSearchParams();
    return params?.get("q") ?? null;
  } catch {
    return null;
  }
}

/**
 * Concierge chat surface. Streams the structured /api/concierge response. Human-exit visible
 * throughout; never blocks the visible phone numbers behind a loading state.
 */
export function ConciergeChat() {
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialQuery = useInitialQuery();
  const autoFiredRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, pending]);

  // If the user landed via /discover?q=..., auto-fire the question once.
  useEffect(() => {
    if (autoFiredRef.current || !initialQuery) return;
    autoFiredRef.current = true;
    void send(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

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

  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] lg:h-[calc(100dvh-10rem)] max-h-[760px]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-1 space-y-6"
        aria-live="polite"
        aria-label="Conversation"
      >
        {history.length === 0 && (
          <div className="py-10">
            <p className="display text-3xl lg:text-4xl text-ink">How can we help?</p>
            <p className="mt-3 text-sm text-ink-700 max-w-xl">
              Tell us about the room, a piece you're drawn to, or a question about care. We'll point you to specific
              rugs in the collection, suggest a path, and never quote a price online — that we handle in person or by email.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {OPENERS.map((o) => (
                <button
                  key={o}
                  onClick={() => send(o)}
                  className="text-left text-sm border border-ink-300/60 px-3 py-2 hover:border-oxblood hover:text-oxblood"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}
        {history.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-auto max-w-xl" : "max-w-xl"}>
            <p className="eyebrow mb-1">{m.role === "user" ? "You" : "Concierge"}</p>
            <p className={m.role === "user" ? "text-sm text-ink" : "text-base text-ink leading-relaxed display"}>
              {m.content}
            </p>
          </div>
        ))}
        {pending && (
          <div className="max-w-xl">
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
        className="mt-6 border-t border-ink-300/40 pt-5 space-y-3"
      >
        <label htmlFor="concierge-input" className="sr-only">
          Message the concierge
        </label>
        <div className="flex items-end gap-3">
          <textarea
            id="concierge-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="A heritage Heriz for a long room with northern light…"
            rows={2}
            className="flex-1 border border-ink-700/50 bg-transparent p-3 text-sm focus:outline-none focus:border-oxblood resize-none"
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="px-5 py-3 bg-oxblood text-cream text-sm tracking-wide-2 disabled:opacity-60 hover:bg-oxblood-800"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-ink-500">
          Prefer a person? Call{" "}
          <a href={humanExitContent.chicago.phoneHref} className="text-oxblood">
            {humanExitContent.chicago.phone}
          </a>
          {" or "}
          <a href={humanExitContent.evanston.phoneHref} className="text-oxblood">
            {humanExitContent.evanston.phone}
          </a>
          {" — or "}
          <Link href="/visit" className="text-oxblood">
            book a visit
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
