import { describe, it, expect } from "vitest";
import { answerFaq } from "../lib/faq";

describe("FAQ retrieval grounding", () => {
  it("routes silk cleaning to professional-only with a matched entry", async () => {
    const a = await answerFaq("can I clean my silk rug at home");
    expect(a.matched).not.toBeNull();
    expect(a.matched?.slug).toBe("silk-rug-cleaning");
    expect(a.matched?.routing).toBe("professional-only");
    expect(a.routesToHuman).toBe(true);
  });

  it("returns vacuum guidance for everyday wool", async () => {
    const a = await answerFaq("how should I vacuum my hand-knotted wool rug");
    expect(a.matched).not.toBeNull();
    expect(a.matched?.routing).toBe("diy-ok");
  });

  it("routes price questions to the quote-process answer", async () => {
    const a = await answerFaq("why aren't prices listed on this site");
    expect(a.matched?.category).toBe("quote-process");
    expect(a.routesToHuman).toBe(true);
  });

  it("hands off when retrieval is empty / very low signal", async () => {
    const a = await answerFaq("xyz random nonsense unrelated");
    expect(a.routesToHuman).toBe(true);
  });
});
