import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { getJournal, journalEntries } from "@/lib/journal";

export function generateStaticParams() {
  return journalEntries.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const j = getJournal(slug);
  if (!j) return {};
  return { title: j.title, description: j.excerpt };
}

export default async function JournalEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const j = getJournal(slug);
  if (!j) notFound();

  return (
    <Container size="narrow">
      <article className="py-20 lg:py-28">
        <Eyebrow>
          {new Date(j.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })} · {j.tags.join(" · ")}
        </Eyebrow>
        <h1 className="display text-5xl text-ink mt-4 leading-tight">{j.title}</h1>
        <div className="mt-10 space-y-7 text-base text-ink-700 leading-relaxed">
          {j.body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-14">
          <Link href="/journal" className="text-oxblood text-sm hover:underline">
            ← All entries
          </Link>
        </div>
      </article>
    </Container>
  );
}
