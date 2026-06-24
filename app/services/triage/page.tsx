import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PhotoTriage } from "@/components/PhotoTriage";
import { HumanExit } from "@/components/HumanExit";

export const metadata: Metadata = {
  title: "Service triage",
  description:
    "Send a few photos and a short note. We'll review and suggest the next step — drop-off, house call, or showroom inspection.",
};

export default function TriagePage() {
  return (
    <Container size="narrow">
      <section className="py-20 lg:py-24">
        <PhotoTriage mode="service" />
      </section>
      <section className="pb-24">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
