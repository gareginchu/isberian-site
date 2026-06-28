"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Self-hosted 3D + AR viewer using Google's `<model-viewer>` web component.
 * Loads a .glb file of the rug as a textured plane sized to real-world
 * dimensions; supports drag/rotate/zoom on desktop and "View in your space"
 * AR on Android (Scene Viewer) and iOS (Quick Look via .usdz when present).
 *
 * Floating toolbar in the bottom-right gives explicit zoom in / out, reset,
 * auto-rotate toggle, and fullscreen — the gestures already work, but the
 * icons advertise them. Buttons drive model-viewer's imperative API
 * (`cameraOrbit`, `resetTurntableRotation()`, `autoRotate`).
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
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
        },
        HTMLElement
      >;
    }
  }
}

// Subset of the model-viewer element's imperative API we touch from the toolbar.
type ModelViewerEl = HTMLElement & {
  cameraOrbit?: string;
  autoRotate?: boolean;
  resetTurntableRotation?: (azimuthDeg?: number) => void;
  getCameraOrbit?: () => { theta: number; phi: number; radius: number; toString(): string };
  jumpCameraToGoal?: () => void;
};

const MIN_RADIUS_PCT = 35;
const MAX_RADIUS_PCT = 220;
const ZOOM_STEP_PCT = 18;

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const mvRef = useRef<ModelViewerEl>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Lazy-load the model-viewer module on the client. The component registers
  // itself as a custom element when imported.
  useEffect(() => {
    import("@google/model-viewer").catch(() => {
      /* Failed to load — model-viewer just won't initialize; the <model-viewer>
         tag will render as an empty inline element. Not catastrophic. */
    });
  }, []);

  // Track fullscreen state so the icon toggles correctly when the user hits Esc.
  useEffect(() => {
    function onChange() {
      setFullscreen(document.fullscreenElement === wrapRef.current);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Read the current orbit, adjust the radius, write it back. model-viewer
  // animates to the new orbit on its own.
  function setRadius(deltaPct: number) {
    const mv = mvRef.current;
    if (!mv) return;
    const orbit = mv.getCameraOrbit?.();
    if (!orbit) return;
    // model-viewer expresses radius internally in meters, but accepts string
    // orbits in percent. Round-trip via a parsed-percent fallback so this
    // works whether the original orbit string was set in % or in meters.
    const currentString = orbit.toString(); // e.g. "0deg 75deg 1.5m"
    const m = currentString.match(/^(\S+)\s+(\S+)\s+(\S+)$/);
    if (!m) return;
    const [, theta, phi, radius] = m;
    const pctMatch = radius.match(/^([\d.]+)%$/);
    let nextPct: number;
    if (pctMatch) {
      nextPct = parseFloat(pctMatch[1]) + deltaPct;
    } else {
      // Default mid-range when the current orbit is in meters; deltas still feel right.
      nextPct = 100 + deltaPct;
    }
    nextPct = Math.max(MIN_RADIUS_PCT, Math.min(MAX_RADIUS_PCT, nextPct));
    mv.cameraOrbit = `${theta} ${phi} ${nextPct}%`;
  }

  function resetView() {
    const mv = mvRef.current;
    if (!mv) return;
    mv.cameraOrbit = "0deg 75deg 105%";
    mv.resetTurntableRotation?.();
    mv.jumpCameraToGoal?.();
  }

  function toggleAutoRotate() {
    const mv = mvRef.current;
    if (!mv) return;
    const next = !autoRotate;
    mv.autoRotate = next;
    setAutoRotate(next);
  }

  async function toggleFullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* user-gesture / browser refused — silent fail */
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full bg-cream-200 border border-ink-300/60 overflow-hidden"
      style={{ aspectRatio: fullscreen ? "auto" : "5/3", height: fullscreen ? "100%" : undefined }}
    >
      {/* @ts-expect-error — model-viewer is a registered custom element, not a known JSX intrinsic */}
      <model-viewer
        ref={mvRef}
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
        min-camera-orbit="auto auto 35%"
        max-camera-orbit="auto auto 220%"
        style={{ width: "100%", height: "100%", background: "transparent" }}
      />

      {/* Floating toolbar — bottom-right of the canvas. Visible always so visitors
          can see what they can do. AR button is rendered by model-viewer itself
          (bottom-center) when the device supports it. */}
      <div
        role="toolbar"
        aria-label="3D viewer controls"
        className="absolute bottom-3 right-3 flex flex-col gap-1 rounded-full bg-white/90 backdrop-blur-sm shadow-md ring-1 ring-ink/10 p-1"
      >
        <ToolbarButton label="Zoom in" onClick={() => setRadius(-ZOOM_STEP_PCT)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
            <line x1="11" y1="8" x2="11" y2="14" />
          </svg>
        </ToolbarButton>
        <ToolbarButton label="Zoom out" onClick={() => setRadius(ZOOM_STEP_PCT)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </ToolbarButton>
        <Divider />
        <ToolbarButton label={autoRotate ? "Pause rotation" : "Resume rotation"} onClick={toggleAutoRotate} active={autoRotate}>
          {autoRotate ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="6" y="5" width="3.5" height="14" rx="0.6" />
              <rect x="14.5" y="5" width="3.5" height="14" rx="0.6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </ToolbarButton>
        <ToolbarButton label="Reset view" onClick={resetView}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <polyline points="21 4 21 9 16 9" />
          </svg>
        </ToolbarButton>
        <Divider />
        <ToolbarButton label={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
          {fullscreen ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
            </svg>
          )}
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
        active ? "text-ink bg-ink/10" : "text-ink/70 hover:text-ink hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="block h-px mx-2 bg-ink/10" aria-hidden />;
}
