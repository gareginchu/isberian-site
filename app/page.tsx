import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { HeroCarousel } from "@/components/HeroCarousel";
import { showrooms } from "@/lib/booking/showrooms";
import { listRugs } from "@/lib/catalog";
import type { Rug } from "@/lib/types/rug";

// Hero carousel slides — mirrored from isberian.com's original 8-image rotation. Files live in
// /public/hero/. Order matches the upstream Fusion/Flexslider sequence exactly:
// 1 → 7 → 5 → 6 → 3 → 4 → 2 → 8 (verified from the rendered DOM).
const HERO_SLIDES = [
  { src: "/hero/home-1.jpg", alt: "Brand hero — antique rug photographed in the Chicago showroom." },
  { src: "/hero/home-7.jpg", alt: "Moroccan rug." },
  { src: "/hero/home-5.jpg", alt: "Leather and hide rug." },
  { src: "/hero/home-6.jpg", alt: "Flatweave rug." },
  { src: "/hero/home-3.jpg", alt: "Mosaic rug." },
  { src: "/hero/home-4.jpg", alt: "Antique rug." },
  { src: "/hero/home-2.jpg", alt: "Overdyed rug." },
  { src: "/hero/home-8.jpg", alt: "Hand-knotted rug from the showroom floor." },
];

/** Pick a rug from a pool by partial title match (case-insensitive). */
function pick(rugs: Rug[], match: string): Rug | undefined {
  return rugs.find((r) => r.title.toLowerCase().includes(match.toLowerCase()));
}

function imageOf(rug: Rug | undefined, fallback: string): string {
  return rug?.images.find((i) => i.primary)?.src ?? rug?.images[0]?.src ?? fallback;
}

const FALLBACK_BG =
  "https://cdn.isberian.com/Content/Images/Items/Large/86721.jpg";

const PARTNERS = [
  { name: "IIDA", style: "italic font-serif text-2xl tracking-wide-2" },
  { name: "ASID", style: "font-serif text-2xl tracking-wide-3" },
  { name: "RugMark", style: "uppercase text-xs tracking-wide-3 font-medium" },
  { name: "Michael Del Piero Good Design", style: "italic font-serif text-lg" },
  { name: "Soucie Horner Ltd", style: "uppercase text-xs tracking-wide-3 font-medium" },
];

export default async function HomePage() {
  const rugs = await listRugs();

  // Hand-picked rug imagery for the home page surfaces below the hero. The hero itself runs
  // through HERO_SLIDES via the carousel — same 8 images as the upstream isberian.com.
  const stepsRug = pick(rugs, "imperial rose runner") ?? pick(rugs, "runner") ?? rugs[6];
  const repairRug = pick(rugs, "armenian cloud-band") ?? pick(rugs, "kazak") ?? rugs[3];

  const actions = [
    {
      href: "/rugs",
      title: "Search all rugs",
      body: "Antique, vintage, and contemporary — browse the full collection from both showrooms.",
      image: imageOf(pick(rugs, "ruby highlands kazak") ?? rugs[4], FALLBACK_BG),
    },
    {
      href: "/services/triage",
      title: "Inquire about rug cleaning",
      body: "Hand cleaning, restoration, fringe and selvage work, moth treatment. Send photos for triage.",
      image: imageOf(pick(rugs, "sivas") ?? rugs[1], FALLBACK_BG),
    },
    {
      href: "/carpeting",
      title: "Carpeting for homes & commercial",
      body: "Wool broadloom, naturals, stair runners, and broadloom finished into area rugs.",
      image: imageOf(pick(rugs, "mosaic flatweave") ?? rugs[8], FALLBACK_BG),
    },
    {
      href: "/custom",
      title: "Create custom rugs",
      body: "Size, palette, materials, and drawing — designed to your room and woven with workshop partners.",
      image: imageOf(pick(rugs, "twin medallion oushak") ?? rugs[13], FALLBACK_BG),
    },
  ];

  const styles = [
    {
      label: "Antique Caucasian",
      href: "/rugs?origin=Caucasian",
      image: imageOf(pick(rugs, "guardian cross kazak") ?? rugs[7], FALLBACK_BG),
    },
    {
      label: "Antique Persian",
      href: "/rugs?origin=Persian",
      image: imageOf(pick(rugs, "tree of life lori") ?? rugs[9], FALLBACK_BG),
    },
    {
      label: "Antique Turkish",
      href: "/rugs?origin=Turkish",
      image: imageOf(pick(rugs, "sivas") ?? rugs[1], FALLBACK_BG),
    },
    {
      label: "Flatweaves",
      href: "/rugs?technique=Hand-woven+(flatweave)",
      image: imageOf(pick(rugs, "mosaic flatweave") ?? rugs[8], FALLBACK_BG),
    },
    {
      label: "Runners & long formats",
      href: "/rugs?size=Room",
      image: imageOf(pick(rugs, "imperial rose runner") ?? rugs[12], FALLBACK_BG),
    },
    {
      label: "Tribal & geometric",
      href: "/rugs?origin=Caucasian",
      image: imageOf(pick(rugs, "shirvan sunstone") ?? rugs[16], FALLBACK_BG),
    },
  ];

  return (
    <>
      {/* HERO — 8-image rotating carousel (matches upstream isberian.com) */}
      <HeroCarousel slides={HERO_SLIDES}>
        <Container>
          <div className="relative h-[78dvh] min-h-[560px] max-h-[820px] flex items-end pb-20 lg:pb-28">
            <div className="max-w-2xl text-cream">
              <p className="text-[10px] tracking-wide-3 uppercase opacity-80">Chicago since 1920</p>
              <h1 className="display text-4xl lg:text-6xl mt-5 leading-[1.05]">
                Rugs, carpeting, and custom work — chosen one piece at a time.
                </h1>
                <p className="mt-5 text-base lg:text-lg opacity-90 max-w-xl leading-relaxed">
                  Four generations of family practice. Antique, vintage, and contemporary rugs;
                  wall-to-wall carpeting; custom commissions; cleaning and restoration.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="/rugs"
                    className="inline-flex items-center justify-center bg-cream text-ink px-6 py-3 text-sm tracking-wide-2 hover:bg-cream-200 transition-colors"
                  >
                    Browse the collection
                  </Link>
                  <Link
                    href="/visit"
                    className="inline-flex items-center justify-center border border-cream text-cream px-6 py-3 text-sm tracking-wide-2 hover:bg-cream hover:text-ink transition-colors"
                  >
                    Visit a showroom
                  </Link>
                </div>
              </div>
            </div>
          </Container>
      </HeroCarousel>

      {/* FOUR ACTION TILES */}
      <section>
        <Container>
          <div className="py-14 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>How can we help</Eyebrow>
                <p className="display text-3xl text-ink mt-3">Four ways in.</p>
              </div>
              <Link href="/rugs?status=on-memo" className="text-sm underline underline-offset-4 decoration-ink-300 hover:decoration-ink">
                New arrivals →
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {actions.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="group block">
                    <div className="relative aspect-[5/6] overflow-hidden bg-cream-200">
                      <Image
                        src={a.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.02]"
                      />
                    </div>
                    <p className="display text-xl text-ink mt-5">{a.title}</p>
                    <p className="mt-2 text-sm text-ink-700">{a.body}</p>
                    <p className="mt-3 text-xs tracking-wide-2 uppercase text-ink-500 group-hover:text-ink">
                      Learn more →
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <div className="rule" />

      {/* RUGS BY STYLE — six categories */}
      <section className="bg-cream-200/40">
        <Container>
          <div className="py-16 lg:py-24">
            <div className="text-center max-w-2xl mx-auto">
              <Eyebrow>Rugs by style</Eyebrow>
              <p className="display text-3xl lg:text-4xl text-ink mt-3">
                A century of choosing, narrowed to a handful of categories.
              </p>
            </div>
            <ul className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10">
              {styles.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} className="group block">
                    <div className="relative aspect-square overflow-hidden bg-cream">
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 28vw, 45vw"
                        className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="mt-4 text-sm text-ink font-medium text-center group-hover:text-ink-500 transition-colors">
                      {s.label}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-12 text-center">
              <Link
                href="/rugs"
                className="inline-flex items-center justify-center border border-ink text-ink px-6 py-3 text-sm tracking-wide-2 hover:bg-ink hover:text-cream transition-colors"
              >
                See all rugs
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* STEP-BY-STEP banner */}
      <section>
        <Container>
          <div className="py-16 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative aspect-[4/3] lg:aspect-[5/4]">
              <Image
                src={imageOf(stepsRug, FALLBACK_BG)}
                alt="A long Karabagh runner — the format used for stair runners and long hallways."
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="lg:pl-6">
              <Eyebrow>Step-by-step</Eyebrow>
              <p className="display text-3xl lg:text-4xl text-ink mt-3 max-w-md">
                Let us help you design the ultimate customized staircase.
              </p>
              <p className="mt-5 text-base text-ink-700 max-w-md leading-relaxed">
                Stair runners — borders, brass rods, mitered corners. We measure, fabricate, and
                install. Every step in one practice.
              </p>
              <div className="mt-8">
                <Link
                  href="/carpeting"
                  className="inline-flex items-center justify-center bg-ink text-cream px-6 py-3 text-sm tracking-wide-2 hover:bg-ink-900 transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* REPAIR & RESTORATION banner — reverse layout */}
      <section className="bg-cream-200/40">
        <Container>
          <div className="py-16 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="lg:order-2 relative aspect-[4/3] lg:aspect-[5/4]">
              <Image
                src={imageOf(repairRug, FALLBACK_BG)}
                alt="An Armenian cloud-band rug — the kind of piece our restoration studio handles."
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="lg:order-1 lg:pr-6">
              <Eyebrow>Repair & restoration</Eyebrow>
              <p className="display text-3xl lg:text-4xl text-ink mt-3 max-w-md">
                We don't just patch up your damaged rugs. We restore them.
              </p>
              <p className="mt-5 text-base text-ink-700 max-w-md leading-relaxed">
                Hand cleaning, full restoration, fringe and selvage rebuilding, moth treatment, and
                reweaving. The studio handles pieces we sold and pieces we didn't.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center bg-ink text-cream px-6 py-3 text-sm tracking-wide-2 hover:bg-ink-900"
                >
                  Learn more
                </Link>
                <Link
                  href="/services/triage"
                  className="inline-flex items-center justify-center border border-ink text-ink px-6 py-3 text-sm tracking-wide-2 hover:bg-ink hover:text-cream"
                >
                  Send photos for triage
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SHOWROOMS */}
      <section>
        <Container>
          <div className="py-16 lg:py-24">
            <div className="text-center max-w-xl mx-auto">
              <Eyebrow>Visit</Eyebrow>
              <p className="display text-3xl lg:text-4xl text-ink mt-3">Two showrooms in Chicagoland.</p>
              <p className="mt-4 text-sm text-ink-700">
                Both walk-through. We recommend booking a window so a team member can give you proper attention.
              </p>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-8 lg:gap-10">
              {(["chicago", "evanston"] as const).map((k) => {
                const s = showrooms[k];
                return (
                  <article key={k} className="border border-ink-300/70 bg-cream p-8 lg:p-10">
                    <p className="eyebrow">{s.label}</p>
                    <p className="display text-2xl text-ink mt-3">
                      {s.street}, {s.city}, {s.state} {s.zip}
                    </p>
                    <p className="mt-3 text-sm">
                      <a href={s.phoneHref} className="text-ink underline underline-offset-4 decoration-ink-300 hover:decoration-ink">
                        {s.phone}
                      </a>
                    </p>
                    <ul className="mt-6 text-sm text-ink-700 space-y-1">
                      {s.hours.map((h) => (
                        <li key={h.day} className="flex justify-between max-w-[18rem]">
                          <span className="text-ink-500">{h.day}</span>
                          <span>
                            {h.open}–{h.close}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a
                        href={s.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center bg-ink text-cream px-5 py-2.5 text-sm tracking-wide-2 hover:bg-ink-900"
                      >
                        Get directions
                      </a>
                      <Link
                        href="/visit"
                        className="inline-flex items-center justify-center border border-ink text-ink px-5 py-2.5 text-sm tracking-wide-2 hover:bg-ink hover:text-cream"
                      >
                        Book a visit
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* PARTNERS / PRESS strip */}
      <section className="border-y border-ink-300/70 bg-cream">
        <Container>
          <div className="py-10">
            <p className="eyebrow text-center">Recognized by · partnered with</p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 lg:gap-x-16 gap-y-6 text-ink-500">
              {PARTNERS.map((p) => (
                <li key={p.name} className={p.style}>
                  {p.name}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* NEWSLETTER */}
      <section>
        <Container>
          <div className="py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Eyebrow>Stay close</Eyebrow>
              <p className="display text-3xl text-ink mt-3 max-w-md">
                Add me to your email list.
              </p>
              <p className="mt-3 text-sm text-ink-700 max-w-md">
                A few notes a year — new arrivals, journal entries, the occasional invitation. We
                never share your address.
              </p>
            </div>
            <NewsletterSignup />
          </div>
        </Container>
      </section>
    </>
  );
}
