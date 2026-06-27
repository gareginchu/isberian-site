import Image from "next/image";

/**
 * QR-code surface for the rug's external 3D / AR viewer (e.g. Carpetify).
 * Designed for the rug detail page — visitor scans with their phone camera,
 * the 3D view loads on the phone (where AR-via-camera is most useful).
 *
 * Server component — pure presentation, no client JS.
 */
export function View3DQr({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="border border-ink-300/60 bg-cream-200/40 p-5 flex items-start gap-5">
      <div className="relative w-[120px] h-[120px] flex-shrink-0 bg-white border border-ink-300/40">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="120px"
          className="object-contain p-1"
        />
      </div>
      <div className="space-y-2">
        <p className="eyebrow">3D / AR view</p>
        <p className="text-sm text-ink-700 leading-relaxed max-w-xs">
          Scan with your phone camera to see this rug in 3D — and place it in
          your own room with augmented reality.
        </p>
      </div>
    </div>
  );
}
