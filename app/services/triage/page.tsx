import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PhotoTriage } from "@/components/PhotoTriage";
import { HumanExit } from "@/components/HumanExit";

export const metadata: Metadata = {
  title: "Service triage",
  description:
    "Send a few photos and a short note. We'll review and suggest the next step — drop-off, house call, or showroom inspection.",
};

const triageServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Rug cleaning, restoration & service triage",
  serviceType: "Rug cleaning and restoration",
  description:
    "Send a few photos and a short note. Our specialists review and route the piece to the right path — drop-off, house call, or showroom inspection. We don't recommend household cleaning for valuable or antique pieces.",
  url: "https://isberian.com/services/triage",
  provider: {
    "@type": "RugStore",
    name: "Oscar Isberian Rugs",
    url: "https://isberian.com",
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Chicago metropolitan area",
  },
};

export default function TriagePage() {
  return (
    <Container size="narrow">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(triageServiceJsonLd) }}
      />
      <section className="py-20 lg:py-24">
        <PhotoTriage mode="service" />
      </section>
      <section className="pb-24">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
