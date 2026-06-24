import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Oscar Isberian Rugs — Heritage rug house, Chicago and Evanston";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF8",
          color: "#1F1F1E",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6E6E6C",
            }}
          >
            Chicago since 1920
          </div>
          <div
            style={{
              fontSize: 96,
              marginTop: 28,
              lineHeight: 1.02,
              letterSpacing: "0.005em",
              fontWeight: 500,
            }}
          >
            Oscar Isberian Rugs
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: 28,
              maxWidth: 880,
              color: "#3A3A38",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.35,
            }}
          >
            Rugs, carpeting, and custom work — chosen one piece at a time.
            Antique, vintage, and contemporary, quoted in person.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 18,
            color: "#6E6E6C",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.06em",
          }}
        >
          <span>120 W Kinzie · Chicago  ·  1028 Chicago Ave · Evanston</span>
          <span>isberian.com</span>
        </div>
      </div>
    ),
    size,
  );
}
