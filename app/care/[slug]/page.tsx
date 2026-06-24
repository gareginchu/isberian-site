import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { HumanExit } from "@/components/HumanExit";
import { getCare, listCare } from "@/lib/faq";

export async function generateStaticParams() {
  const all = await listCare();
  return all.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCare(slug);
  if (!c) return {};
  return { title: c.title, description: c.excerpt };
}

export default async function CareGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCare(slug);
  if (!c) notFound();
  return (
    <Container size="narrow">
      <article className="py-20 lg:py-28">
        <Eyebrow>Care guide{c.routing === "professional-only" ? " · professional handling" : ""}</Eyebrow>
        <h1 className="display text-5xl text-ink mt-4 leading-tight">{c.title}</h1>
        <div className="mt-10 space-y-5 text-base text-ink-700 leading-relaxed">
          {c.body.split("\n\n").map((para, i) => {
            if (para.startsWith("## ")) {
              return (
                <p key={i} className="display text-2xl text-ink mt-8">
                  {para.replace(/^## /, "")}
                </p>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>
        <div className="mt-12">
          <Link href="/care" className="text-oxblood text-sm hover:underline">
            ← All care guides
          </Link>
        </div>
      </article>
      <section className="pb-20">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
