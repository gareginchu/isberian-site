import type { Rug } from "@/lib/types/rug";
import type { FaqEntry } from "@/lib/types/faq";
import { showrooms } from "@/lib/booking/showrooms";

/**
 * AEO substrate. Every rug + service + FAQ page emits correct JSON-LD. We deliberately omit the
 * `offers` field on rug products — there are no public prices, and a price-less Product entry is
 * preferable to a fabricated one.
 */

/**
 * Canonical site origin. Mirrors `metadataBase` in `app/layout.tsx`. JSON-LD `item` URLs must be
 * absolute, so we resolve relative hrefs against this.
 */
const SITE_ORIGIN = "https://isberian.com";

function absoluteUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `${SITE_ORIGIN}${path}`;
}

function Script({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "RugStore",
    name: "Oscar Isberian Rugs",
    url: "https://isberian.com",
    foundingDate: "1920",
    description:
      "A century-old Chicago rug house. Antique, vintage, and contemporary rugs, custom commissions, expert cleaning and restoration.",
    department: (["chicago", "evanston"] as const).map((k) => {
      const s = showrooms[k];
      return {
        "@type": "Store",
        name: s.label,
        telephone: `+1-${s.phone.replace(/-/g, "-")}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: s.street,
          addressLocality: s.city,
          addressRegion: s.state,
          postalCode: s.zip,
          addressCountry: "US",
        },
      };
    }),
  };
  return <Script data={data} />;
}

export function RugJsonLd({ rug }: { rug: Rug }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: rug.title,
    description: rug.description.lead,
    image: rug.images.map((i) => i.src),
    brand: { "@type": "Brand", name: "Oscar Isberian Rugs" },
    category: rug.description.provenance.origin,
    // Intentionally no `offers` field — quoted only.
    additionalProperty: [
      { "@type": "PropertyValue", name: "Size", value: rug.description.details.sizeImperial },
      { "@type": "PropertyValue", name: "Technique", value: rug.description.details.technique },
      { "@type": "PropertyValue", name: "Materials", value: rug.description.details.materials.join(", ") },
      ...(rug.description.details.age
        ? [{ "@type": "PropertyValue", name: "Age", value: rug.description.details.age.circa }]
        : []),
      ...(rug.description.provenance.region
        ? [{ "@type": "PropertyValue", name: "Region", value: rug.description.provenance.region }]
        : []),
    ],
  };
  return <Script data={data} />;
}

export function FaqJsonLd({ entries }: { entries: FaqEntry[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
  return <Script data={data} />;
}

export type BreadcrumbItem = { name: string; href: string };

/**
 * Emits a `BreadcrumbList` JSON-LD block. `item` URLs are resolved to absolute against the
 * canonical site origin so crawlers and AEO consumers get fully-qualified URLs.
 */
export function BreadcrumbListJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.href),
    })),
  };
  return <Script data={data} />;
}

export function ServiceJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: { "@type": "Organization", name: "Oscar Isberian Rugs" },
    areaServed: ["Chicago, IL", "Evanston, IL", "Greater Chicagoland"],
  };
  return <Script data={data} />;
}

/**
 * Per-showroom `LocalBusiness` (Store) JSON-LD so map snippets and per-location rich results can
 * render. The aggregate `RugStore` in `OrganizationJsonLd` covers the brand; this covers each
 * physical location with its own address, phone, hours, and stable `@id` anchor. Intentionally no
 * `priceRange` — quoted only — and no `geo`/`image` since they aren't in the showroom source.
 */
const DAY_OF_WEEK: Record<string, string> = {
  Mon: "https://schema.org/Monday",
  Tue: "https://schema.org/Tuesday",
  Wed: "https://schema.org/Wednesday",
  Thu: "https://schema.org/Thursday",
  Fri: "https://schema.org/Friday",
  Sat: "https://schema.org/Saturday",
  Sun: "https://schema.org/Sunday",
};

export function ShowroomLocalBusinessJsonLd() {
  const keys = ["chicago", "evanston"] as const;
  return (
    <>
      {keys.map((key) => {
        const s = showrooms[key];
        // phoneHref is "tel:+13124671212" — turn into "+1-312-467-1212".
        const telDigits = s.phoneHref.replace(/^tel:\+/, "");
        const telephone =
          telDigits.length === 11
            ? `+${telDigits[0]}-${telDigits.slice(1, 4)}-${telDigits.slice(4, 7)}-${telDigits.slice(7)}`
            : s.phoneHref.replace(/^tel:/, "");
        const data = {
          "@context": "https://schema.org",
          "@type": "Store",
          "@id": `https://isberian.com/visit#${key}`,
          name: `Oscar Isberian Rugs — ${s.label}`,
          url: `https://isberian.com/visit#${key}`,
          telephone,
          address: {
            "@type": "PostalAddress",
            streetAddress: s.street,
            addressLocality: s.city,
            addressRegion: s.state,
            postalCode: s.zip,
            addressCountry: "US",
          },
          openingHoursSpecification: s.hours.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: DAY_OF_WEEK[h.day] ?? h.day,
            opens: h.open,
            closes: h.close,
          })),
        };
        return <Script key={key} data={data} />;
      })}
    </>
  );
}
