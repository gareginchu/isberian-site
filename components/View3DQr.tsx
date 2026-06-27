/**
 * QR-code surface that links to /rugs/<slug>/ar — visitor scans with their
 * phone camera and lands directly in AR (Scene Viewer on Android, Quick
 * Look on iOS). No tap on a button; the rug appears on their floor.
 *
 * Server component. `src` should be `/api/rugs/<slug>/qr` (the dynamic QR
 * route) or a pre-rendered .png path. `alt` is the screen-reader label.
 */
export function View3DQr({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="border border-ink-300/60 bg-cream-200/40 p-5 flex items-start gap-5">
      <div className="w-[140px] h-[140px] flex-shrink-0 bg-white border border-ink-300/40 p-2">
        {/* Plain <img> so server-render serves the QR without next/image
            transforms — the QR PNG is already PNG-optimal for scanning. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={120} height={120} className="block w-full h-full" />
      </div>
      <div className="space-y-2">
        <p className="eyebrow">Scan to view in your room</p>
        <p className="text-sm text-ink-700 leading-relaxed max-w-xs">
          Scan with your phone camera. The rug will open in augmented reality
          on your floor — sized to scale. No app to install.
        </p>
      </div>
    </div>
  );
}
