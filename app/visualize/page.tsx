import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Visualizer } from "@/components/Visualizer";
import { HumanExit } from "@/components/HumanExit";
import { listRugs } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Visualize a rug in a room",
  description:
    "Pick one of our reference rooms and a rug from the floor. We'll show you how it sits in the space. Preliminary — the final answer lives in the showroom.",
};

export default async function VisualizePage() {
  const rugs = await listRugs();
  return (
    <Container size="default">
      <section className="py-16 lg:py-24 space-y-10">
        <header className="max-w-2xl">
          <Eyebrow>Visualize</Eyebrow>
          <h1 className="display text-4xl lg:text-5xl text-ink mt-4 leading-tight">
            See a rug in a room before you see it on the floor.
          </h1>
          <p className="mt-4 text-base text-ink-700 leading-relaxed">
            Pick a reference room, then pick a rug. We project the piece into the space so you can
            read the scale and palette in context. Preliminary — the final answer always lives in
            the showroom with the rug under the light.
          </p>
        </header>

        <Visualizer rugs={rugs} initialRoomSlug="bedroom" />
      </section>

      <section className="pb-24">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
