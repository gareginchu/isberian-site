import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { RugDescriptionBlock } from "@/components/RugDescriptionBlock";
import { RugCard } from "@/components/RugCard";
import { LeadForm } from "@/components/LeadForm";
import { HumanExit } from "@/components/HumanExit";
import { RugJsonLd } from "@/components/JsonLd";
import { getRug, findSimilar, listRugs } from "@/lib/catalog";

export async function generateStaticParams() {
  const rugs = await listRugs();
  return rugs.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRug(slug);
  if (!r) return {};
  return {
    title: r.title,
    description: r.description.lead,
    openGraph: {
      title: r.title,
      description: r.description.lead,
      images: r.images.map((i) => ({ url: i.src, alt: i.alt })),
    },
  };
}

export default async function RugDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rug = await getRug(slug);
  if (!rug) notFound();
  const similar = await findSimilar(rug.id, 4);

  return (
    <>
      <RugJsonLd rug={rug} />
      <Container size="wide">
        <section className="pt-10 pb-6">
          <Link href="/rugs" className="text-xs tracking-wide-2 uppercase text-oxblood hover:underline">
            ← The collection
          </Link>
        </section>
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 pb-20">
          <div className="space-y-6">
            {rug.images.map((img, i) => (
              <div key={i} className="relative aspect-[4/5] bg-cream-200 overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start space-y-10">
            <div>
              <Eyebrow>
                {rug.status === "available" ? "Available" : rug.status === "on-memo" ? "On memo" : "Sold"} ·{" "}
                {rug.description.provenance.region ?? rug.description.provenance.origin}
              </Eyebrow>
              <h1 className="display text-4xl text-ink mt-3 leading-tight">{rug.title}</h1>
            </div>
            <RugDescriptionBlock d={rug.description} />
            {rug.status === "available" && (
              <div className="border-t border-ink-300/40 pt-8">
                <LeadForm
                  type="quote"
                  rugId={rug.id}
                  rugTitle={rug.title}
                  heading="Request a quote"
                  blurb="We'll be in touch with a clear quote, condition notes, and a suggested next step — a visit, memo to your room, or shipping. Prices are quoted, not published; that's how we work."
                />
              </div>
            )}
            <HumanExit tone="muted" />
          </div>
        </section>

        {similar.length > 0 && (
          <section className="py-16 border-t border-ink-300/40">
            <div className="flex items-end justify-between">
              <div>
                <Eyebrow>More like this</Eyebrow>
                <p className="display text-3xl text-ink mt-3">Adjacent in palette and weave.</p>
              </div>
            </div>
            <ul className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {similar.map((r) => (
                <li key={r.id}>
                  <RugCard rug={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
