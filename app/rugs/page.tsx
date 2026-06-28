import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { RugFilters } from "@/components/RugFilters";
import { RugGrid } from "@/components/RugGrid";
import { RugGridControls } from "@/components/RugGridControls";
import { BreadcrumbListJsonLd } from "@/components/JsonLd";
import { listRugs } from "@/lib/catalog";
import { filterRugs } from "@/lib/search";
import type { Rug, RugFacets } from "@/lib/types/rug";

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

/** Free-text token match across title, lead, palette, design features,
 *  region, and materials. Light-weight; sufficient for the catalog scale. */
function matchesQuery(r: Rug, q: string): boolean {
  if (!q) return true;
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = [
    r.title,
    r.description.lead,
    r.description.designFeatures.join(" "),
    r.description.colorPalette.map((c) => c.name).join(" "),
    r.description.provenance.origin,
    r.description.provenance.region ?? "",
    r.description.details.materials.join(" "),
  ].join(" ").toLowerCase();
  return terms.every((t) => hay.includes(t));
}

function sortRugs(rugs: Rug[], sort: string): Rug[] {
  const arr = [...rugs];
  if (sort === "title-asc") arr.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "title-desc") arr.sort((a, b) => b.title.localeCompare(a.title));
  else if (sort === "size-asc" || sort === "size-desc") {
    const area = (r: Rug) => {
      const m = r.description.details.sizeImperial.match(/(\d+)'\s*(\d+)?"?\s*[×x]\s*(\d+)'\s*(\d+)?"?/);
      if (!m) return 0;
      const w = parseInt(m[1] ?? "0", 10) + parseInt(m[2] ?? "0", 10) / 12;
      const l = parseInt(m[3] ?? "0", 10) + parseInt(m[4] ?? "0", 10) / 12;
      return w * l;
    };
    arr.sort((a, b) => sort === "size-asc" ? area(a) - area(b) : area(b) - area(a));
  } else {
    // Default "Newest" — sort by updatedAt descending.
    arr.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }
  return arr;
}

export default async function RugsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const facets = paramsToFacets(sp);
  const q = (typeof sp.q === "string" ? sp.q : "").trim();
  const sort = typeof sp.sort === "string" ? sp.sort : "new";
  const perPage = Math.max(6, Math.min(100, parseInt((typeof sp.perPage === "string" ? sp.perPage : "24"), 10) || 24));
  const page = Math.max(1, parseInt((typeof sp.page === "string" ? sp.page : "1"), 10) || 1);

  const all = await listRugs();
  const facetFiltered = filterRugs(all, facets);
  const queryFiltered = q ? facetFiltered.filter((r) => matchesQuery(r, q)) : facetFiltered;
  const sorted = sortRugs(queryFiltered, sort);
  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
  const clampedPage = Math.min(page, pageCount);
  const visible = sorted.slice((clampedPage - 1) * perPage, clampedPage * perPage);

  return (
    <Container size="wide">
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Rugs", href: "/rugs" },
        ]}
      />
      <section className="py-12 lg:py-16">
        <Eyebrow>The collection</Eyebrow>
        <h1 className="display text-4xl lg:text-5xl text-ink mt-3 leading-tight">
          {sorted.length === all.length ? `${all.length} pieces` : `${sorted.length} of ${all.length} pieces`}
        </h1>
        <p className="mt-4 max-w-2xl text-ink-700 text-sm lg:text-base">
          A rotating selection. The full collection is much larger than what fits online; tell us what
          you&apos;re looking for and we&apos;ll bring out what isn&apos;t on the floor.
        </p>
      </section>
      <section className="grid lg:grid-cols-[16rem_1fr] gap-12 pb-24">
        <RugFilters />
        <div>
          <RugGridControls
            total={all.length}
            filtered={sorted.length}
            page={clampedPage}
            pageCount={pageCount}
          />
          <RugGrid rugs={visible} />
          {pageCount > 1 && (
            <div className="mt-10 flex justify-center">
              <BottomPagination page={clampedPage} pageCount={pageCount} sp={sp} />
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}

/** Server-rendered bottom pagination so the page is fully navigable without
 *  JS (crawlers, accessibility tools). Arrows are <Link>s that preserve every
 *  other query param (?q, ?sort, ?perPage, facets) and only update ?page. */
function BottomPagination({
  page,
  pageCount,
  sp,
}: {
  page: number;
  pageCount: number;
  sp: Record<string, string | string[] | undefined>;
}) {
  function hrefFor(n: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "page") continue;
      if (Array.isArray(v)) v.forEach((item) => params.append(k, item));
      else if (v !== undefined) params.set(k, v);
    }
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/rugs?${qs}` : "/rugs";
  }
  const atFirst = page === 1;
  const atLast = page === pageCount;
  return (
    <nav aria-label="Pagination" className="flex items-center gap-2 text-xs text-ink-700">
      <PageLink href={hrefFor(1)} disabled={atFirst} label="First page">«</PageLink>
      <PageLink href={hrefFor(page - 1)} disabled={atFirst} label="Previous page">‹</PageLink>
      <span className="px-2">
        Page <strong className="text-ink">{page}</strong> of {pageCount}
      </span>
      <PageLink href={hrefFor(page + 1)} disabled={atLast} label="Next page">›</PageLink>
      <PageLink href={hrefFor(pageCount)} disabled={atLast} label="Last page">»</PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const cls = "inline-flex items-center justify-center w-7 h-7 border border-ink-300/60 transition-colors";
  if (disabled) {
    return (
      <span aria-disabled className={`${cls} text-ink/20 cursor-not-allowed`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={`${cls} text-ink-700 hover:border-ink hover:text-oxblood`}>
      {children}
    </Link>
  );
}
