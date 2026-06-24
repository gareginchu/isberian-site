import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { FaqJsonLd } from "@/components/JsonLd";
import { HumanExit } from "@/components/HumanExit";
import { listFaq, listCare } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Care & FAQ",
  description:
    "How to care for a hand-knotted rug, what we do and don't recommend, and the questions we hear most often. Grounded answers — no improvised care advice.",
};

export default async function CarePage() {
  const [faq, care] = await Promise.all([listFaq(), listCare()]);
  return (
    <>
      <FaqJsonLd entries={faq} />
      <Container size="narrow">
        <section className="py-20 lg:py-28">
          <Eyebrow>Care & FAQ</Eyebrow>
          <h1 className="display text-5xl text-ink mt-4 leading-tight">
            Quiet habits, careful hands.
          </h1>
          <p className="mt-6 text-ink-700 max-w-2xl">
            A hand-knotted rug rewards a little attention. The notes below cover the questions we
            hear most often. For anything specific to your piece — particularly antique, silk, or
            naturally dyed rugs — call us before applying any household solution.
          </p>
        </section>

        <section className="py-12 border-t border-ink-300/40">
          <p className="eyebrow">Care guides</p>
          <ul className="mt-6 space-y-8">
            {care.map((c) => (
              <li key={c.id}>
                <Link href={`/care/${c.slug}`} className="group block">
                  <p className="display text-2xl text-ink group-hover:text-oxblood transition-colors">{c.title}</p>
                  <p className="mt-2 text-sm text-ink-700">{c.excerpt}</p>
                  {c.routing === "professional-only" && (
                    <p className="mt-2 text-xs text-saddle-700 tracking-wide-2 uppercase">Professional handling</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-12 border-t border-ink-300/40">
          <p className="eyebrow">Frequently asked</p>
          <ul className="mt-6 divide-y divide-ink-300/40">
            {faq.map((f) => (
              <li key={f.id} className="py-5">
                <details>
                  <summary className="display text-xl text-ink cursor-pointer hover:text-oxblood">{f.question}</summary>
                  <div className="mt-3 text-sm text-ink-700 whitespace-pre-line">{f.answer}</div>
                  {f.routesToHuman && (
                    <p className="mt-3 text-xs text-oxblood">Best handled with a person — call us or book a visit.</p>
                  )}
                </details>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-12">
          <HumanExit />
        </section>
      </Container>
    </>
  );
}
