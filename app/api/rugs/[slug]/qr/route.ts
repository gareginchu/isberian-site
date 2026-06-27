import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";
import { getRug } from "@/lib/catalog";

export const runtime = "nodejs";

/**
 * Returns a PNG QR code that, when scanned, opens `/rugs/<slug>/ar` — which
 * in turn redirects the visitor's phone to native AR (Scene Viewer on
 * Android, Quick Look on iOS). One scan from a printed tag or a desktop
 * page and the rug is on the floor.
 *
 *   GET /api/rugs/<slug>/qr        → 280x280 PNG
 *
 * Cached at the edge for a day since the encoded URL is stable.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const rug = await getRug(slug);
  if (!rug) {
    return new NextResponse("not found", { status: 404 });
  }
  const arUrl = `${req.nextUrl.origin}/rugs/${rug.slug}/ar`;
  const png = await QRCode.toBuffer(arUrl, {
    type: "png",
    margin: 2,
    width: 280,
    color: { dark: "#1F1F1E", light: "#FAFAF8" },
    errorCorrectionLevel: "M",
  });
  // Next.js expects Web-API BodyInit; cast the Node Buffer to Uint8Array.
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
