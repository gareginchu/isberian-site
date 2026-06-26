import { ImageResponse } from "next/og";
import { getRug } from "@/lib/catalog";

export const runtime = "nodejs"; // we need fs access via Next image loader; nodejs is safer here
export const alt = "An Isberian rug.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Resolve the absolute origin so `<img src=…>` inside the OG canvas can actually be fetched
 * by next/og. Mirrors the precedence used in `app/layout.tsx` for `metadataBase`:
 *
 *   NEXT_PUBLIC_SITE_URL  ›  VERCEL_URL  ›  https://isberian.com
 *
 * On a Vercel deploy `VERCEL_URL` is the actual deployed host (e.g.
 * `isberian-site-qbj6.vercel.app`), which is where the `/rugs/<id>.jpg` static assets
 * actually live. The apex `isberian.com` 404s today; once it's wired we'll set
 * `NEXT_PUBLIC_SITE_URL` to flip the canonical.
 */
function originForAssets(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://isberian.com";
}

function absoluteUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  const base = originForAssets().replace(/\/$/, "");
  return `${base}${src.startsWith("/") ? src : `/${src}`}`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rug = await getRug(slug);
  if (!rug) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#FAFAF8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontFamily: "Georgia, serif",
            color: "#1F1F1E",
          }}
        >
          Oscar Isberian Rugs
        </div>
      ),
      size,
    );
  }

  // Primary image: prefer the one flagged `primary`, else the first.
  const primary = rug.images.find((i) => i.primary) ?? rug.images[0];
  const rugImageUrl = primary ? absoluteUrl(primary.src) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF8",
          color: "#1F1F1E",
          display: "flex",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "55%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 16,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#6E6E6C",
              }}
            >
              Oscar Isberian Rugs · since 1920
            </div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 56,
                marginTop: 32,
                lineHeight: 1.08,
                letterSpacing: "0.005em",
              }}
            >
              {rug.title}
            </div>
            <div style={{ fontSize: 22, marginTop: 24, color: "#3A3A38", lineHeight: 1.4 }}>
              {rug.description.lead.slice(0, 220)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 16,
              color: "#6E6E6C",
              letterSpacing: "0.06em",
            }}
          >
            <span>{rug.description.details.sizeImperial}</span>
            <span>·</span>
            <span>{rug.description.details.technique}</span>
            <span>·</span>
            <span>{rug.description.provenance.region ?? rug.description.provenance.origin}</span>
          </div>
        </div>
        <div
          style={{
            width: "45%",
            height: "100%",
            background: "#F1F1EE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {rugImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rugImageUrl}
              alt={primary?.alt ?? rug.title}
              width={540}
              height={630}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
