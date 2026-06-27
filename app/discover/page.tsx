import type { Metadata } from "next";
import { Suspense } from "react";
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
        {/* Suspense boundary so ConciergeChat can read `?q=` (the query
            handed off from the homepage's HomeConcierge surface) without
            bailing static rendering. */}
        <Suspense fallback={null}>
          <ConciergeChat />
        </Suspense>
      </section>
    </Container>
  );
}
