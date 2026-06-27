"use client";

import { useEffect } from "react";

/**
 * Self-hosted 3D + AR viewer using Google's `<model-viewer>` web component.
 * Loads a .glb file of the rug as a textured plane sized to real-world
 * dimensions; supports drag/rotate/zoom on desktop and "View in your space"
 * AR on Android (Scene Viewer) and iOS (Quick Look — requires a .usdz which
 * we don't yet generate; iOS shows the 3D viewer but the AR button is hidden).
 */

// TypeScript shim — <model-viewer> isn't part of React's standard JSX types.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean | string;
          "ar-modes"?: string;
          "camera-controls"?: boolean | string;
          "auto-rotate"?: boolean | string;
          "shadow-intensity"?: string;
          "shadow-softness"?: string;
          exposure?: string;
          "ios-src"?: string;
          poster?: string;
          loading?: "auto" | "lazy" | "eager";
        },
        HTMLElement
      >;
    }
  }
}

export function RugViewer3D({
  glbUrl,
  usdzUrl,
  alt,
  posterUrl,
}: {
  glbUrl: string;
  usdzUrl?: string;
  alt: string;
  posterUrl?: string;
}) {
  // Lazy-load the model-viewer module on the client. The component registers
  // itself as a custom element when imported.
  useEffect(() => {
    import("@google/model-viewer").catch(() => {
      /* Failed to load — model-viewer just won't initialize; the <model-viewer>
         tag will render as an empty inline element. Not catastrophic. */
    });
  }, []);

  return (
    <div className="relative w-full bg-cream-200 border border-ink-300/60 overflow-hidden" style={{ aspectRatio: "5/3" }}>
      {/* @ts-expect-error — model-viewer is a registered custom element, not a known JSX intrinsic */}
      <model-viewer
        src={glbUrl}
        ios-src={usdzUrl}
        alt={alt}
        poster={posterUrl}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        shadow-softness="0.8"
        exposure="0.9"
        loading="lazy"
        style={{ width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}
