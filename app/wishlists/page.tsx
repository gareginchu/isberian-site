import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { LeadForm } from "@/components/LeadForm";
import { HumanExit } from "@/components/HumanExit";

export const metadata: Metadata = {
  title: "Wishlists — save pieces, hear when something lands",
  description:
    "Start a wishlist by email. We'll hold the pieces you're considering and notify you when a matching rug lands.",
};

export default function WishlistsPage() {
  return (
    <Container size="narrow">
      <section className="py-16 lg:py-24">
        <Eyebrow>Wishlists</Eyebrow>
        <h1 className="display text-4xl lg:text-5xl text-ink mt-5">
          Save what you're drawn to.
        </h1>
        <p className="mt-6 text-base text-ink-700 leading-relaxed">
          We don't run consumer accounts — wishlists are by email. Send us a note with the pieces
          you're considering and a sense of the brief, and we'll keep an eye out for what matches. When
          one of them is at risk of going on memo, we let you know first.
        </p>
        <div className="mt-10">
          <LeadForm
            type="wishlist"
            heading="Start a wishlist"
            blurb="Mention any pieces by name or include their links. We'll follow up within a business day."
          />
        </div>
      </section>
      <section className="pb-20">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
