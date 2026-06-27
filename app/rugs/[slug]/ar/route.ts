import { NextResponse, type NextRequest } from "next/server";
import { getRug } from "@/lib/catalog";

export const runtime = "nodejs";
// Always run at request time — we need the User-Agent header.
export const dynamic = "force-dynamic";

/**
 * Smart AR landing route. Detects the visitor's device and redirects:
 *   - Android → Scene Viewer intent URL (Google's AR app launches with the .glb)
 *   - iOS     → the rug's .usdz (Safari auto-opens it in Quick Look AR)
 *   - Other   → the rug detail page (no AR available; falls back to 3D viewer)
 *
 * Visitor scans a QR encoding `/rugs/<slug>/ar` and lands in AR directly —
 * zero clicks once the camera resolves the code.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const rug = await getRug(slug);
  const origin = _req.nextUrl.origin;
  if (!rug) {
    return NextResponse.redirect(new URL("/rugs", origin), 302);
  }

  const ua = _req.headers.get("user-agent") ?? "";
  const isAndroid = /Android/i.test(ua) && !/Windows Phone/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const detailUrl = `${origin}/rugs/${rug.slug}`;

  // Android — Scene Viewer intent URL.
  if (isAndroid && rug.model3dGlbUrl) {
    const fileUrl = `${origin}${rug.model3dGlbUrl}`;
    const fallback = encodeURIComponent(detailUrl);
    const file = encodeURIComponent(fileUrl);
    const intent =
      `intent://arvr.google.com/scene-viewer/1.0?file=${file}&mode=ar_only` +
      `#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;` +
      `S.browser_fallback_url=${fallback};end`;
    return NextResponse.redirect(intent, 302);
  }

  // iOS — direct USDZ link; Safari Quick Look opens it as AR automatically.
  if (isIOS && rug.model3dUsdzUrl) {
    return NextResponse.redirect(`${origin}${rug.model3dUsdzUrl}`, 302);
  }

  // Desktop / no AR support — fall back to the rug detail page.
  return NextResponse.redirect(detailUrl, 302);
}
