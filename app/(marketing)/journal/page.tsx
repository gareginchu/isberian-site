import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { listJournal } from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal — notes from the showroom",
  description: "Slow, specific writing about rugs from the team at Oscar Isberian Rugs.",
};

export default function JournalPage() {
  const entries = listJournal();
  return (
    <Container size="narrow">
      <section className="py-20 lg:py-28">
        <Eyebrow>Journal</Eyebrow>
        <h1 className="display text-5xl text-ink mt-4 leading-tight">Notes from the showroom.</h1>
        <ul className="mt-14 space-y-14">
          {entries.map((j) => (
            <li key={j.slug} className="border-b border-ink-300/40 pb-12 last:border-b-0">
              <Link href={`/journal/${j.slug}`} className="group block">
                <p className="eyebrow">
                  {new Date(j.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })} · {j.tags.join(" · ")}
                </p>
                <p className="display text-3xl text-ink mt-3 group-hover:text-oxblood transition-colors">
                  {j.title}
                </p>
                <p className="mt-4 text-base text-ink-700 max-w-prose">{j.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
