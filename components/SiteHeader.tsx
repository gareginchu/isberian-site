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
    label: "Cleaning & Restoration",
    children: [
      { href: "/services", label: "Overview" },
      { href: "/services/triage", label: "Service triage" },
      { href: "/care", label: "Care & FAQ" },
    ],
  },
  { href: "/rugs?status=on-memo", label: "On the floor now" },
  { href: "/trade", label: "Trade benefits" },
  { href: "/visit", label: "Contact us" },
  { href: "/wishlists", label: "Wishlists" },
];

const SECONDARY: Item[] = [
  { href: "/discover", label: "Concierge" },
  { href: "/identify", label: "Identify a rug" },
  { href: "/journal", label: "Journal" },
  { href: "/story", label: "Story" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState<string | null>(null);

  // Header is always overlaid (matches upstream isberian.com): absolute on the home
  // page so the carousel can start at y=0; sticky-transparent on interior pages so
  // it floats over the page content the same way.
  const headerCls = isHome
    ? "absolute top-0 left-0 right-0 z-30 text-cream"
    : "sticky top-0 z-30 text-cream";

  const mainRowCls = "bg-transparent";

  return (
    <header className={headerCls}>
      {/* Top utility row — transparent, white text, Montserrat 14px. */}
      <div className="hidden lg:block bg-transparent">
        <Container>
          <div className="flex items-center justify-end gap-6 py-2 nav-text text-[14px] text-cream">
            {SECONDARY.map((s) => (
              <Link key={s.href} href={s.href} className="hover:text-cream/70 transition-colors">
                {s.label}
              </Link>
            ))}
            <span className="text-cream/40">·</span>
            <a href="tel:+13124671212" className="hover:text-cream/70">
              Chicago 312-467-1212
            </a>
            <a href="tel:+18474750000" className="hover:text-cream/70">
              Evanston 847-475-0000
            </a>
          </div>
        </Container>
      </div>

      <div className={mainRowCls}>
        <Container>
          <div className="flex items-center justify-between py-5 lg:py-6">
            <Link href="/" className="block" aria-label="Oscar Isberian Rugs — Established 1920">
              <Image
                src="/logo-white.png"
                alt="Oscar Isberian Rugs — Established 1920"
                width={337}
                height={94}
                priority
                className="h-[63px] w-auto"
              />
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-7 nav-text text-[15px] uppercase">
                {PRIMARY.map((item) => (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => item.children && setOpen(item.href)}
                    onMouseLeave={() => setOpen(null)}
                  >
                    <Link
                      href={item.href}
                      className="text-cream hover:text-cream/70 py-2 inline-flex items-center gap-1"
                    >
                      {item.label}
                      {item.children && (
                        <span aria-hidden className="text-cream/50 text-xs">
                          ▾
                        </span>
                      )}
                    </Link>
                    {item.children && open === item.href && (
                      <div className="absolute left-0 top-full pt-2">
                        <ul className="min-w-[16rem] bg-transparent py-2">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block px-4 py-2 nav-text text-[14px] text-cream hover:text-cream/70"
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
              <span aria-hidden className="block w-6 h-px bg-cream mb-1.5" />
              <span aria-hidden className="block w-6 h-px bg-cream mb-1.5" />
              <span aria-hidden className="block w-6 h-px bg-cream" />
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
