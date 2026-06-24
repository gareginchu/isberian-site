import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { LinkButton } from "@/components/Button";
import { HumanExit } from "@/components/HumanExit";
import { ServiceJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Cleaning, restoration, and repair",
  description:
    "Hand cleaning in our studio, full restoration, fringe and selvage work, moth treatment, and reweaving. We handle pieces we sold and pieces we didn't.",
};

const SERVICES = [
  {
    title: "Hand cleaning",
    body:
      "We dust the rug first to remove the soil that's worked into the foundation — that's where wear actually comes from. The wet step is hand cleaning with the right rinse for the dyes, dried flat and on-square in a controlled room.",
  },
  {
    title: "Full restoration",
    body:
      "Reweaving worn or missing pile, rebuilding ends and selvages, repairing tears, and stabilizing fragile foundations. The aim is invisible work — the restoration should disappear.",
  },
  {
    title: "Fringe and selvage",
    body:
      "Original ends and selvages affect value as much as the pile. We rebuild and protect both — preserving the original where we can, replacing in matched material where we can't.",
  },
  {
    title: "Moth and pest",
    body:
      "Treatment in our facility for active infestation, followed by hand cleaning. We can also advise on prevention — storage, rotation, and the right environment.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <ServiceJsonLd
        name="Rug cleaning and restoration"
        description="Hand cleaning, restoration, fringe and selvage work, moth treatment, and reweaving by Oscar Isberian Rugs."
        url="https://isberian.com/services"
      />
      <Container size="default">
        <section className="py-20 lg:py-28">
          <Eyebrow>Services</Eyebrow>
          <h1 className="display text-5xl text-ink mt-4 leading-tight">
            Cleaning. Restoration. Repair.
          </h1>
          <p className="mt-6 max-w-2xl text-ink-700">
            We handle pieces we sold and pieces we didn't. The first step is a free in-showroom
            inspection or a quick service triage online.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/services/triage">Send photos for triage</LinkButton>
            <LinkButton href="/visit" variant="secondary">
              Bring it in
            </LinkButton>
          </div>
        </section>

        <section className="pb-20 grid sm:grid-cols-2 gap-10 lg:gap-14">
          {SERVICES.map((s) => (
            <div key={s.title}>
              <p className="display text-2xl text-ink">{s.title}</p>
              <p className="mt-3 text-sm text-ink-700">{s.body}</p>
            </div>
          ))}
        </section>

        <div className="rule" />

        <section className="py-16">
          <p className="display text-3xl text-ink">A note on antique and silk pieces.</p>
          <p className="mt-4 max-w-2xl text-sm text-ink-700">
            Silk pile, natural dyes, and antique foundations are sensitive in ways modern wool is not.
            Household methods — bleach, vinegar, steam, machine wash — can cause permanent damage. If
            you have a piece you care about,{" "}
            <Link href="/care/antique-and-silk" className="text-oxblood underline-offset-4 hover:underline">
              read our note on antique and silk care
            </Link>
            , and please don't apply household solutions before talking to us.
          </p>
        </section>

        <section className="pb-24">
          <HumanExit />
        </section>
      </Container>
    </>
  );
}
