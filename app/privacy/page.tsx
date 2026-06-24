import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <Container size="narrow">
      <article className="py-20 lg:py-28">
        <Eyebrow>Privacy</Eyebrow>
        <h1 className="display text-4xl text-ink mt-3">A short, plain notice.</h1>
        <div className="mt-10 space-y-6 text-sm text-ink-700 leading-relaxed">
          <p>
            We collect what you choose to share with us — your name, contact details, photos of your
            rug, the conversation transcript — and we use it to help you. We don't sell it.
          </p>
          <p>
            Concierge transcripts and photos are retained for {process.env.SESSION_RETENTION_DAYS ?? 30}{" "}
            days for follow-up and quality, then deleted. CRM records (your contact + the project)
            are retained as long as we're working together and for a reasonable window after.
          </p>
          <p>
            You can ask us to delete your record at any time by emailing{" "}
            <a href="mailto:info@isberian.com" className="text-oxblood">
              info@isberian.com
            </a>
            .
          </p>
        </div>
      </article>
    </Container>
  );
}
