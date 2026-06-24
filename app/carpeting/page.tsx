import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { LinkButton } from "@/components/Button";
import { LeadForm } from "@/components/LeadForm";
import { HumanExit } from "@/components/HumanExit";

export const metadata: Metadata = {
  title: "Carpeting — wall-to-wall, broadloom, sisal",
  description:
    "Wall-to-wall carpeting and broadloom from established mills. Measured, specified, and installed by our team. Quoted in person.",
};

const FAMILIES = [
  {
    title: "Wool broadloom",
    body:
      "Heritage broadloom in wool from long-standing mills. Patterns and solids; cut-pile, loop, and combinations.",
  },
  {
    title: "Natural fibers",
    body: "Sisal, seagrass, jute, and woven naturals. Durable, beautiful, easy to live with.",
  },
  {
    title: "Stair runners",
    body: "Borders, brass rods, mitered corners. We measure, fabricate, and install on site.",
  },
  {
    title: "Area rug binding",
    body: "Broadloom finished as an area rug to a custom size — bound, serged, or with sewn borders.",
  },
];

export default function CarpetingPage() {
  return (
    <Container size="default">
      <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 lg:py-24">
        <div>
          <Eyebrow>Carpeting</Eyebrow>
          <h1 className="display text-4xl lg:text-5xl text-ink mt-5">
            Wall-to-wall and broadloom, specified to your room.
          </h1>
          <p className="mt-6 text-base text-ink-700 max-w-xl leading-relaxed">
            Wool broadloom from established mills, natural fibers, custom stair runners, and broadloom
            finished into area rugs. We measure and install in the Chicago area; we ship outside it.
            Like everything we do, carpeting is quoted in person, not online.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/visit">Book a measure</LinkButton>
            <LinkButton href="#inquire" variant="secondary">
              Ask about a project
            </LinkButton>
          </div>
        </div>
        <div className="relative aspect-[5/6]">
          <Image
            src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&q=80&auto=format&fit=crop"
            alt="A wool broadloom carpet sample."
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="rule" />

      <section className="py-16 lg:py-20">
        <Eyebrow>What we offer</Eyebrow>
        <ul className="mt-8 grid sm:grid-cols-2 gap-10 lg:gap-14">
          {FAMILIES.map((f) => (
            <li key={f.title}>
              <p className="display text-xl text-ink">{f.title}</p>
              <p className="mt-3 text-sm text-ink-700">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="inquire" className="py-16 grid lg:grid-cols-2 gap-12">
        <div>
          <p className="display text-3xl text-ink">Start a carpeting project.</p>
          <p className="mt-3 text-sm text-ink-700 max-w-md">
            Tell us about the spaces, the rough dimensions, and the look you're after. We'll respond
            with options and a measure window.
          </p>
        </div>
        <LeadForm type="quote" />
      </section>

      <section className="pb-20">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
