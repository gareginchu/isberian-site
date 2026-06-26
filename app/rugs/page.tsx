import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { RugFilters } from "@/components/RugFilters";
import { RugGrid } from "@/components/RugGrid";
import { BreadcrumbListJsonLd } from "@/components/JsonLd";
import { listRugs } from "@/lib/catalog";
import { filterRugs } from "@/lib/search";
import type { RugFacets } from "@/lib/types/rug";

export const metadata: Metadata = {
  title: "Rugs — the collection",
  description:
    "The current selection on the floor: antique Persian, Turkish, Caucasian, Indian, Tibetan, Moroccan, Scandinavian, and contemporary pieces. Quoted only.",
};

function paramsToFacets(sp: Record<string, string | string[] | undefined>): RugFacets {
  const arr = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v : v ? [v] : []) as string[];
  return {
    origin: arr(sp.origin) as RugFacets["origin"],
    colorFamily: arr(sp.color),
    sizeBand: arr(sp.size) as RugFacets["sizeBand"],
    technique: arr(sp.technique) as RugFacets["technique"],
  };
}

export default async function RugsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const facets = paramsToFacets(sp);
  const all = await listRugs();
  const rugs = filterRugs(all, facets);

  return (
    <Container size="wide">
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Rugs", href: "/rugs" },
        ]}
      />
      <section className="py-16 lg:py-20">
        <Eyebrow>The collection</Eyebrow>
        <h1 className="display text-5xl text-ink mt-3 leading-tight">{rugs.length} of {all.length} pieces</h1>
        <p className="mt-4 max-w-2xl text-ink-700">
          A rotating selection. The full collection is much larger than what fits online; tell us what
          you're looking for and we'll bring out what isn't on the floor.
        </p>
      </section>
      <section className="grid lg:grid-cols-[16rem_1fr] gap-12 pb-24">
        <RugFilters />
        <div>
          <RugGrid rugs={rugs} />
        </div>
      </section>
    </Container>
  );
}
