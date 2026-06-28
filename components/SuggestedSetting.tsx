import Image from "next/image";

/**
 * AI-generated "suggested setting" image for a rug. Renders only when the
 * generator has produced an image for the rug; labelled clearly as a
 * suggestion so visitors don't confuse it with the actual product
 * photograph (which lives in the gallery above) or with their own room
 * (which is what AR is for).
 *
 * Editorial framing: "Imagined setting" — adjective deliberately chosen so
 * a visitor cannot read the label as "this is the room the rug ships in."
 */
export function SuggestedSetting({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <figure className="border border-ink-300/60 bg-cream-200/40 overflow-hidden">
      <div className="relative w-full" style={{ aspectRatio: "3/2" }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      </div>
      <figcaption className="px-4 py-3 flex items-baseline justify-between gap-3 border-t border-ink-300/40">
        <span className="text-[10px] tracking-wide-2 uppercase text-oxblood">Imagined setting</span>
        <span className="text-[11px] text-ink-500 leading-snug max-w-[34ch] text-right">
          An AI rendering tuned to this rug's palette, era, and size. Not a photograph of the rug in this room.
        </span>
      </figcaption>
    </figure>
  );
}
