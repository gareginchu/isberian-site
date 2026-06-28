"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "./Container";

type Item = { href: string; label: string; children?: { href: string; label: string }[] };

const PRIMARY: Item[] = [
  {
    href: "/rugs",
    label: "Rugs",
    children: [
      { href: "/rugs?origin=Persian", label: "Antique Persian" },
      { href: "/rugs?origin=Turkish", label: "Antique Turkish" },
      { href: "/rugs?origin=Caucasian", label: "Caucasian" },
      { href: "/rugs?origin=Contemporary", label: "Contemporary" },
      { href: "/rugs?origin=Moroccan", label: "Moroccan" },
      { href: "/rugs", label: "All rugs" },
    ],
  },
  { href: "/carpeting", label: "Carpeting" },
  { href: "/custom", label: "Custom" },
  {
    href: "/services",
    label: "Cleaning/Services",
    children: [
      { href: "/services", label: "Overview" },
      { href: "/services/triage", label: "Service triage" },
      { href: "/care", label: "Care & FAQ" },
    ],
  },
  { href: "/rugs?status=on-memo", label: "Clearance" },
  { href: "/trade", label: "Trade Benefits" },
  { href: "/visit", label: "Contact Us" },
  { href: "/wishlists", label: "Wishlists" },
];

// Note: no "Ask" link here. The home page carries a large hero pill and
// every other route has the floating bottom-right pill — adding "Ask" to
// the nav was a third front door to the same room. /discover is still
// reachable by submitting any pill (which navigates to /discover?q=…).
const SECONDARY: Item[] = [
  { href: "/identify", label: "Identify a rug" },
  { href: "/journal", label: "Journal" },
  { href: "/story", label: "Story" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState<string | null>(null);

  // Home: header overlays the carousel (absolute, transparent main row) — the
  // hero imagery sits behind, so the navbar reads in cream over the photos.
  // Interior pages: sticky header on a pale cool grey (legacy isberian.com
  // page colour, #E2E2E2) with dark logo and dark ink nav text — matches
  // the legacy /clearance/ register and pulls the new site closer to the
  // brand visitors already recognise.
  const headerCls = isHome
    ? "absolute top-0 left-0 right-0 z-30 text-cream"
    : "sticky top-0 z-30 text-ink bg-stone";

  const mainRowCls = isHome ? "bg-transparent" : "bg-stone";

  return (
    <header className={headerCls}>
      {/* Top utility strip — on home it stays solid ink so the cream text reads
          over the hero. On interior pages it sits on the pale grey body with
          dark text, matching the legacy clearance navbar. */}
      <div className={`hidden lg:block h-[48px] px-[25px] py-[10px] ${isHome ? "bg-ink" : "bg-stone-100 border-b border-stone-200"}`}>
        <div className={`flex items-center justify-end gap-6 nav-text text-[14px] h-full whitespace-nowrap ${isHome ? "text-cream" : "text-stone-700"}`}>
          {SECONDARY.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`transition-colors whitespace-nowrap ${isHome ? "hover:text-cream/70" : "hover:text-oxblood"}`}
            >
              {s.label}
            </Link>
          ))}
          <span aria-hidden className={isHome ? "text-cream/40" : "text-stone-500"}>·</span>
          <a
            href="tel:+13124671212"
            className={`whitespace-nowrap ${isHome ? "hover:text-cream/70" : "hover:text-oxblood"}`}
          >
            Chicago 312-467-1212
          </a>
          <a
            href="tel:+18474750000"
            className={`whitespace-nowrap ${isHome ? "hover:text-cream/70" : "hover:text-oxblood"}`}
          >
            Evanston 847-475-0000
          </a>
        </div>
      </div>

      <div className={mainRowCls}>
        <Container>
          <div className="flex items-center justify-between py-5 lg:py-6">
            <Link href="/" className="block" aria-label="Oscar Isberian Rugs — Established 1920">
              <Image
                src={isHome ? "/logo-white.png" : "/logo.png"}
                alt="Oscar Isberian Rugs — Established 1920"
                width={337}
                height={94}
                priority
                className="h-[63px] w-auto"
              />
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-6 nav-text text-[15px] uppercase whitespace-nowrap">
                {PRIMARY.map((item) => (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => item.children && setOpen(item.href)}
                    onMouseLeave={() => setOpen(null)}
                  >
                    <Link
                      href={item.href}
                      className={`py-2 inline-flex items-center gap-1 whitespace-nowrap ${
                        isHome
                          ? "text-cream hover:text-cream/70"
                          : "text-ink hover:text-oxblood"
                      }`}
                    >
                      {item.label}
                      {item.children && (
                        <span aria-hidden className={`text-xs ${isHome ? "text-cream/50" : "text-ink/40"}`}>
                          ▾
                        </span>
                      )}
                    </Link>
                    {item.children && open === item.href && (
                      <div className="absolute left-0 top-full pt-2">
                        {/* Home (/) dropdowns open on a transparent backdrop
                            with a soft backdrop-blur — items in cream over
                            the carousel imagery, no panel fill. Interior
                            pages get a white panel + ring + shadow so the
                            items read clearly against the gray navbar. */}
                        <ul
                          className={`min-w-[16rem] py-2 ${
                            isHome
                              ? "bg-transparent backdrop-blur-sm"
                              : "shadow-lg bg-white ring-1 ring-ink/5"
                          }`}
                        >
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`block px-4 py-2 nav-text text-[14px] ${
                                  isHome
                                    ? "text-cream hover:text-cream/70"
                                    : "text-ink hover:bg-stone-100 hover:text-oxblood"
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile menu */}
            <button
              type="button"
              className="lg:hidden p-2 -m-2"
              onClick={() => setOpen(open === "mobile" ? null : "mobile")}
              aria-label="Toggle menu"
              aria-expanded={open === "mobile"}
            >
              <span aria-hidden className={`block w-6 h-px mb-1.5 ${isHome ? "bg-cream" : "bg-ink"}`} />
              <span aria-hidden className={`block w-6 h-px mb-1.5 ${isHome ? "bg-cream" : "bg-ink"}`} />
              <span aria-hidden className={`block w-6 h-px ${isHome ? "bg-cream" : "bg-ink"}`} />
            </button>
          </div>

          {open === "mobile" && (
            <div className="lg:hidden border-t border-cream/10 py-5 bg-transparent">
              <ul className="space-y-3 nav-text text-[15px] uppercase">
                {PRIMARY.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block text-cream hover:text-cream/70"
                      onClick={() => setOpen(null)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-4 border-t border-cream/10 space-y-2 nav-text text-[13px] text-cream/80 normal-case">
                  {SECONDARY.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="block hover:text-cream"
                      onClick={() => setOpen(null)}
                    >
                      {s.label}
                    </Link>
                  ))}
                  <a href="tel:+13124671212" className="block hover:text-cream mt-3">
                    Chicago 312-467-1212
                  </a>
                  <a href="tel:+18474750000" className="block hover:text-cream">
                    Evanston 847-475-0000
                  </a>
                </li>
              </ul>
            </div>
          )}
        </Container>
      </div>
    </header>
  );
}
