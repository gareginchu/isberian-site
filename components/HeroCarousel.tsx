"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string };

type Props = {
  slides: Slide[];
  /** ms between auto-advances. Default 6500. */
  interval?: number;
  /** Render-prop for the overlay content so the host page controls headline/CTAs. */
  children: React.ReactNode;
};

/**
 * Hero carousel — crossfade between slides, auto-advance, pause on hover/focus, respects
 * prefers-reduced-motion. Each slide is a separate <Image> so Next.js can optimize them
 * independently; only the first is `priority` to keep LCP clean.
 */
export function HeroCarousel({ slides, interval = 6500, children }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || paused || slides.length < 2) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, interval);
    return clear;
  }, [paused, interval, slides.length, clear]);

  function jumpTo(i: number) {
    clear();
    setIndex(i);
    // re-arm after a beat so users see the slide they picked
    setPaused(true);
    setTimeout(() => setPaused(false), 50);
  }

  return (
    <section
      className="relative -mt-px"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured rooms and rugs"
    >
      <div className="relative h-[78dvh] min-h-[560px] max-h-[820px] w-full overflow-hidden bg-ink">
        {slides.map((s, i) => (
          <div
            key={s.src}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-out-soft"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <Image
              src={s.src}
              alt={i === 0 ? s.alt : ""}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/25 to-ink/30 pointer-events-none" />
        <div className="relative h-full">{children}</div>

        {/* Indicators */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-3 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              onClick={() => jumpTo(i)}
              className={
                "h-1.5 transition-all duration-500 " +
                (i === index ? "w-10 bg-cream" : "w-5 bg-cream/40 hover:bg-cream/70")
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
