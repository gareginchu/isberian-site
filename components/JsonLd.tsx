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

/**
 * Parse a rug size like `9'2" × 12'4"` into `{ widthIn, heightIn }` in whole inches. Returns null
 * if the string doesn't parse so callers can omit the QuantitativeValue rather than emit zeros.
 * "width" is taken as the first dimension and "height" as the second — schema.org `width`/`height`
 * on Product describe the physical extent of the object, not pixel dimensions, so this maps to the
 * rug's woven width and length.
 */
function parseRugDimensionsInches(imperial: string): { widthIn: number; heightIn: number } | null {
  const m = imperial.match(/(\d+)'\s*(\d+)?"?\s*[×x]\s*(\d+)'\s*(\d+)?"?/);
  if (!m) return null;
  const widthIn = parseInt(m[1] ?? "0", 10) * 12 + parseInt(m[2] ?? "0", 10);
  const heightIn = parseInt(m[3] ?? "0", 10) * 12 + parseInt(m[4] ?? "0", 10);
  if (!widthIn || !heightIn) return null;
  return { widthIn, heightIn };
}

export function RugJsonLd({ rug }: { rug: Rug }) {
  const dims = parseRugDimensionsInches(rug.description.details.sizeImperial);
  // `itemCondition` is our replacement for `offers.availability` — we never emit offers because
  // we never publish prices, but we can still communicate whether the listing is a contemporary
  // new weave or an antique/vintage piece. Sold rugs omit condition (the listing is historical).
  // "Contemporary" origin OR no `age` field → NewCondition; otherwise UsedCondition for the
  // antique/vintage category. This is conservative: any rug with a circa-date is treated as used.
  const isContemporary =
    rug.description.provenance.origin === "Contemporary" || !rug.description.details.age;
  const itemCondition =
    rug.status === "sold"
      ? undefined
      : isContemporary
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition";

  // Primary palette → schema.org `color` (comma-separated, primary chips only). Falls back to
  // omitting if the rug hasn't been editorially enriched yet (lean records have empty palette).
  const primaryColors = rug.description.colorPalette
    .filter((c) => c.weight === "primary")
    .map((c) => c.name);
  const colorString = primaryColors.length > 0 ? primaryColors.join(", ") : undefined;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: rug.title,
    description: rug.description.lead,
    // Absolute URLs so crawlers and AEO consumers don't have to guess the origin.
    image: rug.images.map((i) => absoluteUrl(i.src)),
    brand: { "@type": "Brand", name: "Oscar Isberian Rugs" },
    category: rug.description.provenance.origin,
    // Top-level `material` (in addition to the `additionalProperty` "Materials" entry below — the
    // latter is preserved so existing consumers don't break).
    material: rug.description.details.materials.join(", "),
    ...(colorString ? { color: colorString } : {}),
    ...(itemCondition ? { itemCondition } : {}),
    ...(dims
      ? {
          width: { "@type": "QuantitativeValue", value: dims.widthIn, unitText: "inch" },
          height: { "@type": "QuantitativeValue", value: dims.heightIn, unitText: "inch" },
        }
      : {}),
    // Stable identifier so we're discoverable even if the slug/URL changes. `isberian_rug_id` is
    // the stock number from the in-house catalog.
    identifier: {
      "@type": "PropertyValue",
      propertyID: "isberian_rug_id",
      value: rug.id,
    },
    audience: {
      "@type": "Audience",
      audienceType: "Interior designers, design-conscious homeowners, antique-rug collectors",
    },
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
  serviceType,
}: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: { "@type": "Organization", name: "Oscar Isberian Rugs" },
    areaServed: ["Chicago, IL", "Evanston, IL", "Greater Chicagoland"],
  };
  if (serviceType) data.serviceType = serviceType;
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
