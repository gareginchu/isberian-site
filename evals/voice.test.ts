import { describe, it, expect } from "vitest";
import { fixtureRugs } from "../lib/catalog/fixtures";
import { VOICE, FIVE_RULES, REFUSAL_TEMPLATE } from "../lib/ai/prompts/voice";

/**
 * Voice constraints — applied to fixture copy and to the system-prompt constants. If a future
 * AI-drafted lead drifts into the empty-superlative register, these checks catch it before
 * publish.
 */

const FORBIDDEN_SUPERLATIVES = /\b(exquisite|masterpiece|stunning|breathtaking|gorgeous|magnificent|one[- ]of[- ]a[- ]kind)\b/i;
const FORBIDDEN_EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN_EXCLAMATION = /!/;

describe("Catalog copy voice", () => {
  for (const rug of fixtureRugs) {
    describe(rug.slug, () => {
      it("lead avoids empty superlatives", () => {
        expect(rug.description.lead).not.toMatch(FORBIDDEN_SUPERLATIVES);
      });
      it("lead avoids emoji", () => {
        expect(rug.description.lead).not.toMatch(FORBIDDEN_EMOJI);
      });
      it("lead avoids exclamations", () => {
        expect(rug.description.lead).not.toMatch(FORBIDDEN_EXCLAMATION);
      });
      it("lead is concise (≤ 240 chars)", () => {
        expect(rug.description.lead.length).toBeLessThanOrEqual(240);
      });
    });
  }
});

describe("System prompts encode the rules", () => {
  it("five rules block names all five rules", () => {
    expect(FIVE_RULES).toMatch(/NO PRICES/);
    expect(FIVE_RULES).toMatch(/NO FABRICATED INVENTORY/);
    expect(FIVE_RULES).toMatch(/NO VALUATIONS/);
    expect(FIVE_RULES).toMatch(/NO RISKY DIY/);
    expect(FIVE_RULES).toMatch(/HUMAN EXIT/);
  });
  it("voice block forbids emoji and superlatives explicitly", () => {
    expect(VOICE).toMatch(/no emoji/i);
    expect(VOICE).toMatch(/empty[- ]superlative/i);
  });
  it("refusal template surfaces both showroom phone numbers", () => {
    expect(REFUSAL_TEMPLATE).toMatch(/312-467-1212/);
    expect(REFUSAL_TEMPLATE).toMatch(/847-475-0000/);
  });
});
