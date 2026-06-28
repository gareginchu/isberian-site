import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { LinkButton } from "@/components/Button";

export const metadata: Metadata = {
  title: "Our story — four generations of rugs in Chicago",
  description:
    "Founded in 1920, Oscar Isberian Rugs has been Chicago's rug house for four generations. A short history of the family, the work, and the way we still operate.",
};

export default function StoryPage() {
  return (
    <Container size="narrow">
      <article className="py-20 lg:py-28">
        <Eyebrow>Our story</Eyebrow>
        <h1 className="display text-5xl text-ink mt-4 leading-tight">
          A family, a city, a quiet practice.
        </h1>
        <div className="prose-isberian mt-10 space-y-7 text-base text-ink-700 leading-relaxed">
          <p>
            Oscar Isberian opened the first shop in 1920, a few blocks from where the Chicago showroom
            still sits. He'd come into the trade through a network of weavers and merchants that
            stretched from Tabriz to New York; he stayed in Chicago because the city was buying — and
            because the people who bought, came back.
          </p>
          <p>
            Four generations later, the practice has barely changed. We travel, we look, we choose
            pieces one at a time. We restore what's worth restoring. We commission new work with
            workshops we've known for decades. We send rugs out on memo because most rooms tell you
            the truth that a showroom can't.
          </p>
          <p>
            We don't publish prices and we don't sell anonymously. Every piece is quoted, every quote
            is honest, and every conversation involves a person. We've been at this for a hundred
            years; we plan to be at it for a hundred more.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <LinkButton href="/visit">Visit a showroom</LinkButton>
          {/* Concierge link removed — the floating bottom-right pill is now
              the single entry point for the concierge on every page. */}
        </div>
      </article>
    </Container>
  );
}
