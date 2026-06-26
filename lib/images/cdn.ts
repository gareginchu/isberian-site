/**
 * Dev-mode CDN shim. Today this is a no-op — `IMAGE_CDN_URL` is unset (or set
 * to the placeholder in `.env.example`) and `cdnUrl` returns the local path
 * unchanged, so `next/image` keeps serving from `/public/` via Vercel's
 * built-in optimizer.
 *
 * When the project is ready to migrate to an image CDN (see
 * `docs/image-pipeline.md`), populate `IMAGE_CDN_URL` and start wrapping
 * `src` props at the rollout sites described in section 4 of that doc. This
 * helper intentionally returns a Cloudinary-style query string (`?w=…&q=…`)
 * rather than a path-segment transform so it composes cleanly with both
 * Cloudinary's `fetch` delivery type and Imgix-shaped URLs — the actual
 * transformation grammar is configured CDN-side.
 *
 * Not wired into any component yet; the migration PR will swap call-sites
 * one-by-one.
 */

type CdnOpts = {
  /** Target render width in CSS pixels. Optional — omit for the source image. */
  width?: number;
  /** Quality 1–100. Defaults to 80 when omitted, matching `cloudinaryLoader`. */
  quality?: number;
};

const DEFAULT_QUALITY = 80;

/**
 * Returns a CDN URL for a local-path asset (e.g. `/rugs/17109.jpg`,
 * `/hero/home-1.jpg`, `/logo.png`) when `IMAGE_CDN_URL` is configured.
 * Otherwise returns the input unchanged, so this is safe to drop in behind
 * `next/image`'s `src` prop today as a no-op.
 *
 * The returned URL is a plain `${base}${path}?w=…&q=…` — most CDNs accept
 * this shape directly (Imgix natively, Cloudinary via `fetch`/`delivery`
 * config). When/if we move to Cloudinary's URL-segment grammar
 * (`/w_800,q_80/…`), swap the implementation here; call-sites don't change.
 */
export function cdnUrl(localPath: string, opts: CdnOpts = {}): string {
  const base = process.env.IMAGE_CDN_URL;
  if (!base) {
    return localPath;
  }

  // Defensive: callers should pass a leading-slash path. Tolerate either.
  const normalizedPath = localPath.startsWith("/") ? localPath : `/${localPath}`;
  // Strip any trailing slash on the base so we don't get `//rugs/...`.
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;

  const params = new URLSearchParams();
  if (typeof opts.width === "number" && Number.isFinite(opts.width)) {
    params.set("w", String(Math.round(opts.width)));
  }
  params.set("q", String(opts.quality ?? DEFAULT_QUALITY));

  return `${normalizedBase}${normalizedPath}?${params.toString()}`;
}
