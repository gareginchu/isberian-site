import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingConcierge } from "@/components/FloatingConcierge";
import { OrganizationJsonLd } from "@/components/JsonLd";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500"],
  display: "swap",
});

const nav = Montserrat({
  subsets: ["latin"],
  variable: "--font-nav",
  weight: ["400", "500"],
  display: "swap",
});

/**
 * Resolve the canonical origin for OG / canonical URLs.
 *
 * Order of precedence:
 *   1. `NEXT_PUBLIC_SITE_URL` — explicit override for the production apex once it's live.
 *   2. `VERCEL_URL` — set automatically on every Vercel build/preview; resolves OG images to
 *      the actual deployed host instead of a 404 on the apex.
 *   3. `https://isberian.com` — the eventual canonical, used for local builds and as a final
 *      fallback. Don't remove this; flipping the env var is how we cut over once DNS lands.
 *
 * Captured at build time, which is exactly what we want — `metadataBase` is baked into
 * every rendered page's OG tags.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://isberian.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Oscar Isberian Rugs — Heritage rug house, Chicago & Evanston",
    template: "%s · Oscar Isberian Rugs",
  },
  description:
    "A century-old Chicago rug house. Antique, vintage, and contemporary rugs, custom commissions, expert cleaning and restoration. Showrooms in Chicago and Evanston.",
  openGraph: {
    type: "website",
    siteName: "Oscar Isberian Rugs",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${nav.variable}`}>
      <body className="min-h-dvh bg-cream text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-3 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <FloatingConcierge />
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
