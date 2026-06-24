import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://isberian.com"),
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
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
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
