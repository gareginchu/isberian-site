"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string };

type Props = {
  slides: Slide[];
  /** ms between auto-advances. Default 7000 (Flexslider default, matches isberian.com). */
  interval?: number;
  /** Optional overlay content (legacy). Omit for a clean carousel like upstream isberian.com. */
  children?: React.ReactNode;
};

/**
 * Hero carousel — crossfade between slides, auto-advance, pause on hover/focus, respects
 * prefers-reduced-motion. Prev/next arrows let visitors drive it manually (matches upstream).
 */
export function HeroCarousel({ slides, interval = 7000, children }: Props) {
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

  const jumpTo = useCallback(
    (i: number) => {
      clear();
      setIndex(((i % slides.length) + slides.length) % slides.length);
      setPaused(true);
      setTimeout(() => setPaused(false), 50);
    },
    [clear, slides.length],
  );

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
        {children && <div className="relative h-full">{children}</div>}

        {/* Prev / Next — chevron arrows on each side, like upstream Flexslider. */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => jumpTo(index - 1)}
          className="absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-ink/30 text-cream hover:bg-ink/55 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => jumpTo(index + 1)}
          className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-ink/30 text-cream hover:bg-ink/55 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Indicator dots — bottom-center. */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              onClick={() => jumpTo(i)}
              className={
                "w-3 h-3 rounded-full transition-colors duration-300 " +
                (i === index ? "bg-cream" : "bg-cream/60 hover:bg-cream/85")
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
