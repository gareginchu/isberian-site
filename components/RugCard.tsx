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
      <div className="relative aspect-square overflow-hidden bg-cream-200">
        {primary ? (
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.02]"
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
        <p className="text-sm text-ink leading-tight font-medium group-hover:text-ink-500 transition-colors">
          {rug.title}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          {rug.description.details.sizeImperial} · {rug.description.provenance.region ?? rug.description.provenance.origin}
        </p>
      </div>
    </Link>
  );
}
