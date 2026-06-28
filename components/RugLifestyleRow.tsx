import Image from "next/image";
import type { LifestyleScene } from "@/lib/types/rug";

/**
 * Full-width row of AI-rendered lifestyle scenes for a rug — same role as the
 * stock photos at the bottom of isberian.com's rug pages, but rug-aware.
 *
 * Editorial framing: "Imagined in your room" — the eyebrow and the figcaption
 * both make clear these are renderings derived from the rug's character, not
 * photographs. The real product photo lives above; this row is illustrative.
 *
 * Layout: 2 columns on mobile, up to 4 across at lg. Each card is a 3:2 frame
 * with a short label below it.
 */
export function RugLifestyleRow({
  scenes,
  rugTitle,
}: {
  scenes: LifestyleScene[];
  rugTitle: string;
}) {
  if (!scenes.length) return null;
  return (
    <section className="py-16 border-t border-ink-300/40">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs tracking-wide-2 uppercase text-oxblood">Imagined in your room</p>
          <p className="display text-3xl text-ink mt-3 max-w-2xl">
            {rugTitle.split(" ").slice(0, 2).join(" ")}, in four different settings.
          </p>
          <p className="text-sm text-ink-700 mt-2 max-w-xl leading-relaxed">
            AI renderings tuned to this rug's palette and proportions. Pattern is approximate — the
            photograph above is the definitive image.
          </p>
        </div>
      </div>
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {scenes.map((s) => (
          <li key={s.slug}>
            <figure>
              <div
                className="relative w-full bg-cream-200 border border-ink-300/60 overflow-hidden"
                style={{ aspectRatio: "3/2" }}
              >
                <Image
                  src={s.src}
                  alt={`An imagined interior featuring ${rugTitle} — ${s.label.toLowerCase()}.`}
                  fill
                  sizes="(min-width: 1024px) 22vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[12px] tracking-wide-2 uppercase text-ink-700">
                {s.label}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
