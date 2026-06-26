import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { LeadForm } from "@/components/LeadForm";
import { ShowroomLocalBusinessJsonLd } from "@/components/JsonLd";
import { showrooms } from "@/lib/booking/showrooms";

export const metadata: Metadata = {
  title: "Visit — Chicago and Evanston showrooms",
  description:
    "Both showrooms are walk-through; we recommend booking a window so a team member can give you proper attention.",
};

export default function VisitPage() {
  return (
    <Container size="default">
      <ShowroomLocalBusinessJsonLd />
      <section className="py-20 lg:py-28">
        <Eyebrow>Visit</Eyebrow>
        <h1 className="display text-5xl text-ink mt-4 leading-tight">
          Two showrooms, both walk-through.
        </h1>
        <p className="mt-6 max-w-2xl text-ink-700">
          You're welcome to drop in during open hours. If you'd like a member of the team to give you
          their attention — for a specific brief, a piece on memo, an identification, or a service —
          please book a window. We'll have things ready.
        </p>

        <div className="mt-14 grid lg:grid-cols-2 gap-10">
          {(["chicago", "evanston"] as const).map((key) => {
            const s = showrooms[key];
            return (
              <div key={key} className="border border-ink-300/40 p-7 bg-cream-50">
                <p className="display text-3xl text-ink">{s.label}</p>
                <p className="mt-3 text-sm text-ink-700">
                  {s.street}
                  <br />
                  {s.city}, {s.state} {s.zip}
                </p>
                <p className="mt-3 text-sm">
                  <a href={s.phoneHref} className="text-oxblood hover:underline">
                    {s.phone}
                  </a>
                </p>
                <p className="mt-3 eyebrow">{s.hoursLine}</p>
                <div className="mt-5">
                  <a href={s.mapsUrl} target="_blank" rel="noreferrer" className="text-oxblood text-sm hover:underline">
                    Open in Maps →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-12">
          <div>
            <p className="display text-3xl text-ink">Hold a time.</p>
            <p className="mt-3 text-sm text-ink-700 max-w-md">
              Tell us what you're thinking about — a room, a piece you saw on the site, a rug you'd
              like us to look at. We'll get back to you within a business day.
            </p>
          </div>
          <LeadForm type="visit" />
        </div>
      </section>
    </Container>
  );
}
