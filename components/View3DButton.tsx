"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "View in 3D" button + modal iframe.
 *
 * Renders only if the rug has an external 3D viewer URL (e.g. Carpetify).
 * Click opens a near-fullscreen modal containing the viewer in an iframe.
 * If the iframe fails to load (e.g. provider blocks framing via
 * X-Frame-Options or CSP frame-ancestors), the modal shows a fallback
 * "Open in a new tab" link.
 */
export function View3DButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [iframeOk, setIframeOk] = useState<boolean | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      // If the iframe doesn't fire `load` within 4 s, assume the provider
      // is blocking framing and surface the fallback.
      fallbackTimer.current = setTimeout(() => setIframeOk((v) => v ?? false), 4000);
    } else {
      setIframeOk(null);
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 border border-ink text-ink px-5 py-2.5 text-sm tracking-wide-2 hover:bg-ink hover:text-cream transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <line x1="12" y1="22" x2="12" y2="15" />
          <polyline points="2 8.5 12 15 22 8.5" />
        </svg>
        View in 3D
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`3D view of ${title}`}
          className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={(e) => {
            // close when clicking outside the iframe surface
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full max-w-5xl h-[85vh] bg-cream shadow-2xl flex flex-col">
            <header className="px-5 py-3 border-b border-ink-300/40 flex items-center justify-between bg-cream">
              <div>
                <p className="eyebrow">3D view</p>
                <p className="text-sm text-ink font-medium mt-0.5">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-2 -m-2 text-ink-500 hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </header>

            {iframeOk === false ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
                <p className="display text-2xl text-ink">3D viewer can&apos;t embed here.</p>
                <p className="text-sm text-ink-700 max-w-md">
                  The provider blocks embedding in third-party sites. Open the
                  3D view in a new tab to use it.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center bg-ink text-cream px-6 py-3 text-sm tracking-wide-2 hover:bg-ink-900"
                >
                  Open 3D viewer in new tab
                </a>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={url}
                title={`3D view of ${title}`}
                className="flex-1 w-full border-0 bg-ink"
                allow="accelerometer; gyroscope; magnetometer; xr-spatial-tracking; fullscreen; web-share"
                allowFullScreen
                onLoad={() => {
                  setIframeOk(true);
                  if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
                }}
                onError={() => setIframeOk(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
