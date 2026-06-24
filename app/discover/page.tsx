import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ConciergeChat } from "@/components/ConciergeChat";

export const metadata: Metadata = {
  title: "Discover — concierge",
  description:
    "Tell us about the room, the brief, or a question about care. We'll point you to specific pieces in the collection, grounded in our knowledge base.",
};

export default function DiscoverPage() {
  return (
    <Container size="narrow">
      <section className="pt-10 pb-14 lg:pt-14">
        <ConciergeChat />
      </section>
    </Container>
  );
}
