import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { showrooms } from "@/lib/booking/showrooms";

const COLS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Shop",
    items: [
      { href: "/rugs", label: "Rugs" },
      { href: "/carpeting", label: "Carpeting" },
      { href: "/custom", label: "Custom" },
      { href: "/rugs?status=on-memo", label: "On the floor now" },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/services", label: "Cleaning & restoration" },
      { href: "/services/triage", label: "Service triage" },
      { href: "/care", label: "Care & FAQ" },
      { href: "/identify", label: "Identify a rug" },
    ],
  },
  {
    label: "About",
    items: [
      { href: "/story", label: "Our story" },
      { href: "/journal", label: "Journal" },
      { href: "/trade", label: "Trade benefits" },
      { href: "/wishlists", label: "Wishlists" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink-300/70 bg-cream-200/50">
      <Container>
        <div className="py-14 grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/logo.png"
              alt="Oscar Isberian Rugs — Established 1920"
              width={337}
              height={94}
              className="h-[63px] w-auto"
            />
            <p className="text-sm text-ink-700 mt-4 max-w-xs leading-relaxed">
              A century-old rug house. Antique, vintage, and contemporary rugs; carpeting; custom
              commissions; cleaning and restoration. Quoted in person, never online.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.label}>
              <p className="eyebrow">{col.label}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="text-ink-700 hover:text-ink">
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="eyebrow">Visit</p>
            <ul className="mt-3 space-y-4 text-sm text-ink-700">
              {(["chicago", "evanston"] as const).map((k) => {
                const s = showrooms[k];
                return (
                  <li key={k}>
                    <p className="text-ink">{s.label}</p>
                    <p className="mt-0.5 text-ink-500">
                      {s.street}, {s.city}
                    </p>
                    <p className="mt-0.5">
                      <a href={s.phoneHref} className="text-ink-700 hover:text-ink">
                        {s.phone}
                      </a>
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rule" />
        <div className="py-6 flex flex-col sm:flex-row sm:justify-between gap-3 text-xs text-ink-500">
          <p>© {new Date().getFullYear()} Oscar Isberian Rugs. Quoted only — we do not publish prices.</p>
          <p>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <span className="mx-2">·</span>
            <Link href="/accessibility" className="hover:text-ink">Accessibility</Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
