import { ImageResponse } from "next/og";
import { getRug } from "@/lib/catalog";

export const runtime = "nodejs"; // we need fs access via Next image loader; nodejs is safer here
export const alt = "An Isberian rug.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const rug = await getRug(params.slug);
  if (!rug) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontFamily: "Georgia, serif" }}>
          Oscar Isberian Rugs
        </div>
      ),
      size,
    );
  }

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
        <div style={{ width: "55%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 16, letterSpacing: "0.22em", textTransform: "uppercase", color: "#6E6E6C" }}>
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
          <div style={{ display: "flex", gap: 24, fontSize: 16, color: "#6E6E6C", letterSpacing: "0.06em" }}>
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
          }}
        />
      </div>
    ),
    size,
  );
}
