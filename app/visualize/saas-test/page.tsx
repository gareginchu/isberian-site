import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "Visualizer SaaS comparison",
  description:
    "Side-by-side comparison of commercial AR rug visualizers (Carpetify, Wizart) against our open-source builds — to decide whether to license or keep building.",
  robots: { index: false, follow: false },
};

/**
 * Side-by-side comparison surface for evaluating commercial AR rug visualizers
 * (Carpetify, Wizart) against our open-source CSS and 3D visualizers.
 *
 * Two SaaS panels are placeholders — sign up for each trial (links below the
 * panel), then paste the vendor's embed snippet into the indicated div.
 *
 * Page is `robots: noindex` because it's a vendor-evaluation surface, not a
 * shipping product.
 */
export default function SaaSTestPage() {
  return (
    <Container size="wide">
      <section className="py-14 lg:py-20 space-y-10">
        <header className="max-w-3xl">
          <Eyebrow>Visualizer comparison</Eyebrow>
          <h1 className="display text-4xl lg:text-5xl text-ink mt-4 leading-tight">
            Four ways to see a rug in a room.
          </h1>
          <p className="mt-4 text-base text-ink-700 leading-relaxed">
            Side-by-side evaluation of our two open-source builds against two
            commercial AR visualizers. The goal: decide if Isberian should keep
            building or license. Both SaaS vendors offer 14-day trials with no
            card up front — sign up, paste embed codes into the marked panels
            below, judge side-by-side.
          </p>
          <p className="mt-4 text-xs text-ink-500">
            Internal page · noindexed · do not link from production navigation.
          </p>
        </header>

        {/* ── Our builds ───────────────────────────────────────────────────── */}
        <div>
          <p className="eyebrow mb-4">Our open-source builds</p>
          <div className="grid lg:grid-cols-2 gap-6">
            <Panel
              title="CSS matrix3d projection (v0)"
              subtitle="Live · /visualize"
              note="Deterministic warp of the rug photo into a placement quadrilateral. Drop-shadow under the rug. No AI."
            >
              <iframe
                src="/visualize"
                title="CSS visualizer"
                className="w-full h-[600px] border-0 bg-cream-200"
              />
            </Panel>

            <Panel
              title="Three.js 3D scene (spike)"
              subtitle="Live · /visualize/3d"
              note="Room photo as back-plane in a real 3D scene. Rug textured onto a virtual floor with real cast shadow."
            >
              <iframe
                src="/visualize/3d"
                title="3D visualizer"
                className="w-full h-[600px] border-0 bg-cream-200"
              />
            </Panel>
          </div>
        </div>

        {/* ── SaaS placeholders ────────────────────────────────────────────── */}
        <div>
          <p className="eyebrow mb-4">Commercial AR visualizers (paste embed when trial is live)</p>
          <div className="grid lg:grid-cols-2 gap-6">
            <Panel
              title="Carpetify"
              subtitle={
                <a href="https://www.carpetify.ai/en/" target="_blank" rel="noreferrer" className="underline">
                  carpetify.ai
                </a>
              }
              note="14-day free trial · $49–99/mo after · Self-serve onboarding · Direct links + QR + Shopify/WooCommerce integrations."
            >
              {/* ▼▼▼ PASTE CARPETIFY EMBED HERE ▼▼▼
                  After signing up at https://www.carpetify.ai/en/ and uploading
                  5–10 catalog rugs, copy their embed snippet (iframe or script)
                  and replace the placeholder below.

                  Likely shape:
                    <iframe src="https://app.carpetify.ai/viewer/<your-id>"
                            className="w-full h-[600px] border-0" />
                  Or a script + div pair:
                    <div id="carpetify-embed"></div>
                    <script src="https://app.carpetify.ai/embed.js"></script>
              */}
              <div className="w-full h-[600px] flex flex-col items-center justify-center bg-cream-200 text-ink-500 text-sm gap-3 p-6 text-center">
                <p className="font-medium text-ink">Embed not yet pasted</p>
                <p className="max-w-sm">
                  Sign up at <a className="underline" href="https://www.carpetify.ai/en/" target="_blank" rel="noreferrer">carpetify.ai</a>,
                  upload 5–10 rugs from <code className="text-ink">public/rugs/</code>, then paste their embed snippet into
                  this file — see the comment block in the source.
                </p>
              </div>
            </Panel>

            <Panel
              title="Wizart"
              subtitle={
                <a href="https://wizart.ai/rug-visualizer" target="_blank" rel="noreferrer" className="underline">
                  wizart.ai/rug-visualizer
                </a>
              }
              note="14-day trial · Up to 1,500 SKUs and 5,000 renders during trial · Quote-based pricing after."
            >
              {/* ▼▼▼ PASTE WIZART EMBED HERE ▼▼▼
                  After signing up at https://wizart.ai/rug-visualizer and uploading
                  catalog rugs, copy their embed snippet and replace the placeholder
                  below. Wizart typically uses a JavaScript widget:
                    <script src="https://embed.wizart.ai/widget.js" data-sku="<id>"></script>
                  Or an iframe link to the rendered visualizer.
              */}
              <div className="w-full h-[600px] flex flex-col items-center justify-center bg-cream-200 text-ink-500 text-sm gap-3 p-6 text-center">
                <p className="font-medium text-ink">Embed not yet pasted</p>
                <p className="max-w-sm">
                  Sign up at <a className="underline" href="https://wizart.ai/rug-visualizer" target="_blank" rel="noreferrer">wizart.ai/rug-visualizer</a>,
                  upload catalog rugs, then paste their embed snippet into this file —
                  see the comment block in the source.
                </p>
              </div>
            </Panel>
          </div>
        </div>

        {/* ── Decision matrix ──────────────────────────────────────────────── */}
        <div className="border-t border-ink-300/60 pt-10">
          <p className="eyebrow mb-4">What to judge each on</p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-ink-700">
            {[
              ["Realism", "Does the rug actually look like it sits on the floor — shadow, perspective, integration with the room's lighting?"],
              ["Brand fit", "Can it be white-labeled or restyled to match our type, color, and tone? Or does it always read SaaS?"],
              ["Mobile AR", "Does the customer's phone camera produce a true AR view of the rug on their actual floor? This is what we can't easily build."],
              ["Integration friction", "Embed only? JavaScript widget? REST API for catalog sync? Locked to Shopify? Etc."],
            ].map(([title, body]) => (
              <li key={title}>
                <p className="font-medium text-ink mb-1">{title}</p>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-ink-300/60 pt-6">
          <Link
            href="/visualize"
            className="inline-flex items-center justify-center border border-ink text-ink px-5 py-2.5 text-sm tracking-wide-2 hover:bg-ink hover:text-cream transition-colors"
          >
            ← Back to /visualize
          </Link>
        </div>
      </section>
    </Container>
  );
}

function Panel({
  title,
  subtitle,
  note,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-ink-300/60 bg-cream-200/40">
      <div className="px-5 py-4 border-b border-ink-300/40">
        <p className="display text-xl text-ink">{title}</p>
        <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="bg-white">{children}</div>
      <p className="text-xs text-ink-700 px-5 py-3 leading-relaxed">{note}</p>
    </div>
  );
}
