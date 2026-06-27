"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ROOMS, type Room } from "@/lib/visualizer/rooms";
import { buildMatrix3d, scaleQuad, rugSubQuad, parseRugSizeFt } from "@/lib/visualizer/transform";
import type { Rug } from "@/lib/types/rug";

type Props = {
  rugs: Rug[];
  initialRoomSlug?: string;
  initialRugId?: string;
};

/**
 * Room visualizer (v0). Picks a room + a rug, warps the rug image into the
 * room photo's placement quad via CSS matrix3d. The destination corners are
 * recomputed on resize so the projection stays correct at any viewport width.
 *
 * Known v0 limitations: rug images aren't shot top-down (no alpha mask, no
 * orthographic projection), so the warped rug carries the photographer's
 * perspective into the room. That looks "approximate" — exactly what we want
 * before committing to the proper photography pass.
 */
export function Visualizer({ rugs, initialRoomSlug = "bedroom", initialRugId }: Props) {
  const [roomSlug, setRoomSlug] = useState(initialRoomSlug);
  const [rugId, setRugId] = useState(initialRugId ?? rugs[0]?.id);

  const room: Room = ROOMS.find((r) => r.slug === roomSlug) ?? ROOMS[0];
  const rug: Rug | undefined = rugs.find((r) => r.id === rugId) ?? rugs[0];
  const rugImage = rug?.images.find((i) => i.primary) ?? rug?.images[0];

  const containerRef = useRef<HTMLDivElement>(null);
  const [matrix3d, setMatrix3d] = useState<string>("");

  // Recompute the matrix when the room, rug, or container size changes. The
  // destination quad is the rug's REAL-SIZE sub-quad inside the room's full
  // placement quad — so a 4×6 reads as a scatter, a 9×12 nearly fills the floor.
  useEffect(() => {
    function update() {
      const el = containerRef.current;
      if (!el) return;
      const displayWidth = el.clientWidth;
      if (!displayWidth) return;
      const sizeFt = rug
        ? parseRugSizeFt(rug.description.details.sizeImperial)
        : { widthFt: room.realDimensions.widthFt, depthFt: room.realDimensions.depthFt };
      // Sub-quad in intrinsic photo pixel coords, then scaled to display size.
      const sub = rugSubQuad(room, sizeFt.widthFt, sizeFt.depthFt);
      const displayScale = displayWidth / room.width;
      const scaled = scaleQuad(sub, displayScale);
      setMatrix3d(buildMatrix3d(100, 100, scaled));
    }
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [room, rug]);

  // Aspect ratio of the room photo, used to size the container before the image loads.
  const aspect = useMemo(() => `${room.width} / ${room.height}`, [room.width, room.height]);

  return (
    <div className="space-y-6">
      {/* Room picker */}
      <div>
        <p className="eyebrow mb-2">Choose a room</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ROOMS.map((r) => (
            <button
              key={r.slug}
              type="button"
              onClick={() => setRoomSlug(r.slug)}
              aria-pressed={r.slug === roomSlug}
              className={
                "min-w-[120px] px-3 py-2 text-sm border transition-colors " +
                (r.slug === roomSlug
                  ? "border-ink bg-ink text-cream"
                  : "border-ink-300 text-ink hover:border-ink")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composite view */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-cream-200/40 border border-ink-300/60"
        style={{ aspectRatio: aspect }}
      >
        <Image
          src={room.src}
          alt={room.description}
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover"
          priority
        />
        {rugImage && matrix3d && (
          <div
            aria-hidden
            className="absolute left-0 top-0 pointer-events-none"
            style={{
              width: 100,
              height: 100,
              transform: matrix3d,
              transformOrigin: "0 0",
            }}
          >
            <img
              src={rugImage.src}
              alt=""
              draggable={false}
              className="block w-full h-full select-none"
              style={{
                objectFit: "cover",
                // Soft ground shadow so the rug reads as sitting on the floor,
                // not pasted on. Filter-based shadow follows the warped shape
                // (box-shadow doesn't, because matrix3d defeats it). Strong
                // bottom-falloff via a slightly offset, blurred drop-shadow.
                filter: "drop-shadow(0 8px 14px rgba(20,20,18,0.45))",
              }}
            />
          </div>
        )}
      </div>

      {/* Room caption */}
      <p className="text-xs text-ink-500 leading-relaxed max-w-prose">{room.notes ?? room.description}</p>

      {/* Rug picker */}
      <div>
        <p className="eyebrow mb-2">Choose a rug from the floor</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {rugs.slice(0, 24).map((r) => {
            const img = r.images.find((i) => i.primary) ?? r.images[0];
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRugId(r.id)}
                aria-pressed={r.id === rugId}
                title={r.title}
                className={
                  "aspect-square relative overflow-hidden border transition-colors " +
                  (r.id === rugId
                    ? "border-ink ring-2 ring-ink/40"
                    : "border-ink-300 hover:border-ink")
                }
              >
                {img && (
                  <Image
                    src={img.src}
                    alt={r.title}
                    fill
                    sizes="(min-width: 1024px) 12vw, 30vw"
                    className="object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
        {rugs.length > 24 && (
          <p className="mt-2 text-xs text-ink-500">
            Showing 24 of {rugs.length}. <Link href="/rugs" className="underline hover:text-ink">Browse all rugs</Link>.
          </p>
        )}
      </div>

      {/* Selected rug + CTA */}
      {rug && (
        <div className="border-t border-ink-300/60 pt-6 flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Selected piece</p>
            <p className="display text-2xl text-ink mt-1">{rug.title}</p>
            <p className="text-sm text-ink-500 mt-1">
              {rug.description.provenance.origin}
              {rug.description.details.sizeImperial
                ? ` · ${rug.description.details.sizeImperial}`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/rugs/${rug.slug}`}
              className="inline-flex items-center justify-center border border-ink text-ink px-5 py-2.5 text-sm tracking-wide-2 hover:bg-ink hover:text-cream transition-colors"
            >
              See the rug page
            </Link>
            <Link
              href={`/visit?rug=${encodeURIComponent(rug.id)}`}
              className="inline-flex items-center justify-center bg-ink text-cream px-5 py-2.5 text-sm tracking-wide-2 hover:bg-ink-900 transition-colors"
            >
              Request a quote on this rug
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
