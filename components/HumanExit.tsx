import Link from "next/link";
import { humanExitContent } from "@/lib/guardrails/human-exit";

/**
 * Rule 5: every AI surface and decision-adjacent page must render a visible human exit.
 * Place it inside conversational flows, near forms, and below long content.
 */
export function HumanExit({ tone = "default" }: { tone?: "default" | "muted" }) {
  const c = humanExitContent;
  return (
    <aside
      aria-label="Talk to a person"
      className={
        tone === "muted"
          ? "border border-ink-300/50 bg-cream-50 p-5 text-sm text-ink-700 rounded-none"
          : "border border-oxblood/40 bg-cream p-6 rounded-none"
      }
    >
      <p className="eyebrow">Prefer a person</p>
      <p className="mt-2 text-sm text-ink">
        Reach the team directly:{" "}
        <a href={c.chicago.phoneHref} className="text-oxblood hover:underline">
          {c.chicago.label} {c.chicago.phone}
        </a>
        {" · "}
        <a href={c.evanston.phoneHref} className="text-oxblood hover:underline">
          {c.evanston.label} {c.evanston.phone}
        </a>
        . Or{" "}
        <Link href={c.bookHref} className="text-oxblood hover:underline">
          {c.bookLabel.toLowerCase()}
        </Link>
        .
      </p>
    </aside>
  );
}
