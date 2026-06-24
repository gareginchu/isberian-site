import Link from "next/link";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";

export default function NotFound() {
  return (
    <Container size="narrow">
      <section className="py-32 text-center">
        <Eyebrow>Not found</Eyebrow>
        <h1 className="display text-5xl text-ink mt-3">We can't locate that page.</h1>
        <p className="mt-6 text-ink-700">
          The piece may have moved, or it never lived here. Start from{" "}
          <Link href="/" className="text-oxblood underline-offset-4 hover:underline">
            the home page
          </Link>{" "}
          or{" "}
          <Link href="/rugs" className="text-oxblood underline-offset-4 hover:underline">
            the collection
          </Link>
          .
        </p>
      </section>
    </Container>
  );
}
