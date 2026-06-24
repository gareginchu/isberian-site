import type { Rug } from "@/lib/types/rug";
import type { FaqEntry } from "@/lib/types/faq";
import { showrooms } from "@/lib/booking/showrooms";

/**
 * AEO substrate. Every rug + service + FAQ page emits correct JSON-LD. We deliberately omit the
 * `offers` field on rug products — there are no public prices, and a price-less Product entry is
 * preferable to a fabricated one.
 */

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
