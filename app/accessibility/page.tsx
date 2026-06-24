import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";

export const metadata: Metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <Container size="narrow">
      <article className="py-20 lg:py-28">
        <Eyebrow>Accessibility</Eyebrow>
        <h1 className="display text-4xl text-ink mt-3">Built to WCAG 2.2 AA.</h1>
        <div className="mt-10 space-y-6 text-sm text-ink-700 leading-relaxed">
          <p>
            We test against WCAG 2.2 AA on the grid, the assistant, forms, and modals. Alt text is
            descriptive, focus indicators are visible, and reduced motion is respected.
          </p>
          <p>
            If you run into a barrier on this site, please email{" "}
            <a href="mailto:info@isberian.com" className="text-oxblood">
              info@isberian.com
            </a>{" "}
            or call Chicago at{" "}
            <a href="tel:+13124671212" className="text-oxblood">
              312-467-1212
            </a>
            . We'll fix it.
          </p>
        </div>
      </article>
    </Container>
  );
}
