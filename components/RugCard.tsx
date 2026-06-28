import Link from "next/link";
import Image from "next/image";
import type { Rug } from "@/lib/types/rug";

export function RugCard({ rug, priority = false }: { rug: Rug; priority?: boolean }) {
  const primary = rug.images.find((i) => i.primary) ?? rug.images[0];
  return (
    <Link
      href={`/rugs/${rug.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-200 flex items-center justify-center">
        {primary ? (
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            // object-contain so every rug shows in full — runners as runners, scatters as scatters,
            // no cropping the top off a 4'2"×8'0" Oushak. Cream letterbox fills the square.
            className="object-contain transition-transform duration-700 ease-out-soft group-hover:scale-[1.02] p-2"
            priority={priority}
          />
        ) : null}
        {rug.status !== "available" && (
          <span className="absolute top-3 left-3 bg-ink/90 text-cream eyebrow px-2 py-1">
            {rug.status === "sold" ? "Sold" : "On memo"}
          </span>
        )}
      </div>
      <div className="pt-4">
        <p className="text-[10px] tracking-wide-3 uppercase text-ink-500">
          No. {rug.id}
        </p>
        <p className="mt-1.5 text-sm text-ink leading-tight font-medium group-hover:text-ink-500 transition-colors">
          {rug.title}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          {rug.description.details.sizeImperial} · {rug.description.provenance.region ?? rug.description.provenance.origin}
        </p>
      </div>
    </Link>
  );
}
