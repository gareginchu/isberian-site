import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Curator",
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true },
};

/**
 * Curator backdoor — editor surface for the AI-drafted rug fields. Not linked
 * from anywhere on the public site, robots-blocked at the metadata level, and
 * sits outside the marketing layout (no SiteHeader / FloatingConcierge). The
 * URL is the only access control.
 */
export default function CuratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream-200/50">
      <header className="sticky top-0 z-20 border-b border-ink-300/40 bg-ink text-cream">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/curator" className="text-sm tracking-wide-2 uppercase">
            Curator
          </Link>
          <p className="text-xs text-cream/50">backdoor · noindex · do not link</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
