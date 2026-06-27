import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Visualizer3D } from "@/components/Visualizer3D";
import { HumanExit } from "@/components/HumanExit";
import { listRugs } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "3D Visualizer (spike)",
  description:
    "3D-rendered visualizer spike — Three.js back-plane with the room photo, rug texture on a virtual floor, real lighting and shadows. Compares against /visualize (CSS projection).",
};

export default async function Visualize3DPage() {
  const rugs = await listRugs();
  return (
    <Container size="default">
      <section className="py-16 lg:py-24 space-y-10">
        <header className="max-w-2xl">
          <Eyebrow>Visualize — 3D spike</Eyebrow>
          <h1 className="display text-4xl lg:text-5xl text-ink mt-4 leading-tight">
            See the rug in three dimensions.
          </h1>
          <p className="mt-4 text-base text-ink-700 leading-relaxed">
            Same room, same rug, rendered as a real 3D scene with proper
            lighting and a cast shadow. Preliminary spike to compare against
            the CSS projection at <a href="/visualize" className="underline">/visualize</a>.
          </p>
        </header>

        <Visualizer3D rugs={rugs} />
      </section>

      <section className="pb-24">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
