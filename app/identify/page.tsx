import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PhotoTriage } from "@/components/PhotoTriage";
import { HumanExit } from "@/components/HumanExit";

export const metadata: Metadata = {
  title: "Identify a rug",
  description:
    "Send photos of the front, the back, and a corner. We'll share a preliminary impression of origin, age band, and type. Definitive identification happens in person.",
};

export default function IdentifyPage() {
  return (
    <Container size="narrow">
      <section className="py-20 lg:py-24">
        <PhotoTriage mode="identify" />
      </section>
      <section className="pb-24">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
