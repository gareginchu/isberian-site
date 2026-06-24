import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { LeadForm } from "@/components/LeadForm";
import { HumanExit } from "@/components/HumanExit";

export const metadata: Metadata = {
  title: "Trade — for interior designers and architects",
  description:
    "Designer pricing, memo on approved accounts, project-specific holds, and access to pieces before they're listed.",
};

export default function TradePage() {
  return (
    <Container size="default">
      <section className="py-20 lg:py-28">
        <Eyebrow>Trade</Eyebrow>
        <h1 className="display text-5xl text-ink mt-4 leading-tight max-w-3xl">
          A long, deliberate practice with designers.
        </h1>
        <p className="mt-6 max-w-2xl text-ink-700">
          Trade is a meaningful part of how we work. We offer designer pricing, memo on approved
          accounts, project-specific holds, and access to pieces before they're listed online. We
          also commission, restore, and ship to your specifications.
        </p>
      </section>

      <section className="pb-16 grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <p className="display text-3xl text-ink">How we work with you.</p>
          <ul className="mt-6 space-y-5 text-sm text-ink-700">
            <li><strong className="text-ink">Trade pricing.</strong> Established once your account is approved. Honest and unchanged for the project.</li>
            <li><strong className="text-ink">Memo.</strong> Multiple options sent for client review in the room, with prepaid return.</li>
            <li><strong className="text-ink">Project holds.</strong> Specific pieces reserved during the design phase.</li>
            <li><strong className="text-ink">First look.</strong> Notification when pieces matching active briefs land — before public listing.</li>
            <li><strong className="text-ink">Commissioning.</strong> Custom drawings, palettes, sizes, materials with workshop partners we've known for decades.</li>
            <li><strong className="text-ink">Restoration.</strong> Cleaning, repair, and full restoration on pieces your client already owns.</li>
          </ul>
        </div>
        <LeadForm
          type="trade"
          heading="Open a trade account."
          blurb="Tell us about your practice and a project or two we might help with. We'll respond within a business day."
        />
      </section>

      <section className="pb-24">
        <HumanExit tone="muted" />
      </section>
    </Container>
  );
}
