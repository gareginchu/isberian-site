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
import { View3DButton } from "@/components/View3DButton";
import { View3DQr } from "@/components/View3DQr";
import { RugViewer3D } from "@/components/RugViewer3D";
import { RugLifestyleRow } from "@/components/RugLifestyleRow";
import { RugJsonLd, BreadcrumbListJsonLd } from "@/components/JsonLd";
import { getRug, findSimilar, listRugs } from "@/lib/catalog";

/**
 * Parse a rug size like `4'2" × 8'0"` into a width/length aspect ratio. Used to shape the
 * detail-page image frame so runners aren't cropped to squares and scatters aren't stretched.
 * Falls back to 4/5 if the string doesn't parse.
 */
function parseRugAspect(size: string): number {
  const m = size.match(/(\d+)'\s*(\d+)?"?\s*[×x]\s*(\d+)'\s*(\d+)?"?/);
  if (!m) return 4 / 5;
  const w = parseInt(m[1] ?? "0", 10) * 12 + parseInt(m[2] ?? "0", 10);
  const l = parseInt(m[3] ?? "0", 10) * 12 + parseInt(m[4] ?? "0", 10);
  if (!w || !l) return 4 / 5;
  return w / l;
}

export async function generateStaticParams() {
  const rugs = await listRugs();
  return rugs.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRug(slug);
  if (!r) return {};
  // NOTE: do NOT set `openGraph.images` here. The colocated `opengraph-image.tsx` generator
  // is auto-resolved by Next.js and renders the actual rug into a 1200x630 PNG. Setting
  // `images` here would override the generator and point at a path that 404s on apex.
  return {
    title: r.title,
    description: r.description.lead,
    openGraph: {
      title: r.title,
      description: r.description.lead,
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
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Rugs", href: "/rugs" },
          { name: rug.title, href: `/rugs/${rug.slug}` },
        ]}
      />
      <Container size="wide">
        <section className="pt-10 pb-6">
          <Link href="/rugs" className="text-xs tracking-wide-2 uppercase text-oxblood hover:underline">
            ← The collection
          </Link>
        </section>
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 pb-20">
          {/* Image column: sticky just below the navbar so the photograph
              stays in view while the visitor reads the description, the 3D
              viewer, and the quote form. top-32 = 128px to clear the
              ~110px sticky header without leaving a gap; no internal
              overflow so the column doesn't double-scroll. */}
          <div className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            {rug.images.map((img, i) => {
              // Use the rug's real physical dimensions (e.g. 4'2" × 8'0") to shape the frame.
              // Without this every rug would be cropped to a single aspect — runners would lose
              // their length, scatters would lose their squareness.
              const ratio = parseRugAspect(rug.description.details.sizeImperial);
              return (
                <div
                  key={i}
                  className="relative bg-cream-200 overflow-hidden mx-auto"
                  style={{
                    aspectRatio: ratio,
                    // Cap height so the rug photo never dominates the viewport.
                    // Width auto-derives from the aspect ratio + height cap.
                    maxHeight: "min(75vh, 720px)",
                    // Runners shrink horizontally so they don't become unreadable
                    // strips; everything else fills the column.
                    maxWidth: ratio < 0.5 ? "55%" : "100%",
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
          {/* Right column scrolls naturally so the visitor can read through
              description → 3D viewer + AR → request a quote without leaving
              the image. */}
          <div className="space-y-10">
            <div>
              <Eyebrow>
                No. {rug.id.replace(/^rug-/, "")} ·{" "}
                {rug.status === "available" ? "Available" : rug.status === "on-memo" ? "On memo" : "Sold"} ·{" "}
                {rug.description.provenance.region ?? rug.description.provenance.origin}
              </Eyebrow>
              <h1 className="display text-4xl text-ink mt-3 leading-tight">{rug.title}</h1>
            </div>
            <RugDescriptionBlock d={rug.description} />
            {rug.model3dGlbUrl ? (
              <div className="space-y-5">
                <RugViewer3D
                  glbUrl={rug.model3dGlbUrl}
                  usdzUrl={rug.model3dUsdzUrl}
                  alt={`3D view of ${rug.title}`}
                  posterUrl={rug.images.find((i) => i.primary)?.src ?? rug.images[0]?.src}
                />
                {/* Dynamic QR — visitor scans with their phone camera and lands
                    directly in AR (Scene Viewer on Android, Quick Look on iOS). */}
                <View3DQr
                  src={`/api/rugs/${rug.slug}/qr`}
                  alt={`QR code to view ${rug.title} in AR on your phone`}
                />
              </div>
            ) : rug.viewer3dQrUrl ? (
              <View3DQr src={rug.viewer3dQrUrl} alt={`QR code — view ${rug.title} in 3D`} />
            ) : rug.viewer3dUrl ? (
              <View3DButton url={rug.viewer3dUrl} title={rug.title} />
            ) : null}
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

        {rug.lifestyle && rug.lifestyle.length > 0 && (
          <RugLifestyleRow scenes={rug.lifestyle} rugTitle={rug.title} />
        )}

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
