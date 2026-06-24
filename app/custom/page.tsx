import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { LinkButton } from "@/components/Button";
import { LeadForm } from "@/components/LeadForm";
import { HumanExit } from "@/components/HumanExit";

export const metadata: Metadata = {
  title: "Custom — commissions to your room",
  description:
    "Size, palette, materials, and drawing specified to your room. Commissioned with workshop partners we've known for decades.",
};

const STEPS = [
  { n: "01", t: "Brief", b: "We start with the room: dimensions, light, the architecture, the pieces you already love. A first conversation in person or on a video call." },
  { n: "02", t: "Drawing & palette", b: "A drawing tailored to the brief, with palette samples woven in the wools we'll use. Two or three revisions are common." },
  { n: "03", t: "Workshop", b: "Hand-knotted with workshop partners we've worked with for decades. Periodic photos and progress notes as the rug is woven." },
  { n: "04", t: "Delivery & install", b: "Delivered to your room and laid. Care plan handed over with the piece." },
];

export default function CustomPage() {
  return (
    <Container size="default">
      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center py-16 lg:py-24">
        <div>
          <Eyebrow>Custom & commission</Eyebrow>
          <h1 className="display text-4xl lg:text-5xl text-ink mt-5">
            A piece designed to your room.
          </h1>
          <p className="mt-6 text-base text-ink-700 max-w-xl leading-relaxed">
            We commission rugs from long-standing workshop partners — hand-knotted wool, wool and silk,
            and flatweave. Size, palette, materials, and drawing all specified to your room. Lead time
            is typically several months for hand-knotted work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="#start">Start a commission</LinkButton>
            <LinkButton href="/visit" variant="secondary">
              Visit a showroom
            </LinkButton>
          </div>
        </div>
        <div className="relative aspect-[5/6]">
          <Image
            src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80&auto=format&fit=crop"
            alt="A custom rug in production at one of our workshop partners."
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="rule" />

      <section className="py-16 lg:py-20">
        <Eyebrow>How it works</Eyebrow>
        <ul className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {STEPS.map((s) => (
            <li key={s.n}>
              <p className="text-xs tracking-wide-3 text-ink-500">{s.n}</p>
              <p className="display text-xl text-ink mt-2">{s.t}</p>
              <p className="mt-3 text-sm text-ink-700">{s.b}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="start" className="py-16 grid lg:grid-cols-2 gap-12">
        <div>
          <p className="display text-3xl text-ink">Start a commission.</p>
          <p className="mt-3 text-sm text-ink-700 max-w-md">
            Tell us about the room and what you're imagining. We'll respond with an approach and a
            window for the first conversation.
          </p>
        </div>
        <LeadForm type="quote" rugTitle="Custom commission" />
      </section>

      <section className="pb-20">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
