import { describe, it, expect } from "vitest";
import {
  hasPriceLeak,
  hasValuationClaim,
  isRiskyDiyAdvice,
  hasFabricatedInventory,
  scanAssistantText,
} from "../lib/guardrails";

describe("Rule 1 — no prices", () => {
  const leaks = [
    "This piece is $4,500.",
    "Starting at $1,200",
    "Roughly priced at 5k",
    "Valued at 12,000 dollars",
    "Estimated price range is $3,000–$7,000.",
    "From $899",
    "Retail $8,500",
    "Per square foot pricing on the contract memo",
  ];
  for (const s of leaks) {
    it(`flags: "${s}"`, () => {
      expect(hasPriceLeak(s).violated).toBe(true);
    });
  }
  const clean = [
    "Rugs at this caliber are quoted in person.",
    "We'll share a clear quote once we understand the room.",
    "Hand-knotted, c. 1890, full pile through the center.",
  ];
  for (const s of clean) {
    it(`passes: "${s}"`, () => {
      expect(hasPriceLeak(s).violated).toBe(false);
    });
  }
});

describe("Rule 2 — no fabricated inventory", () => {
  it("flags ids not in the retrieved set", () => {
    expect(
      hasFabricatedInventory({ citedRugIds: ["rug-001", "rug-999"], allowedRugIds: ["rug-001"] })
        .violated,
    ).toBe(true);
  });
  it("passes when all cited ids are in the retrieved set", () => {
    expect(
      hasFabricatedInventory({ citedRugIds: ["rug-001"], allowedRugIds: ["rug-001", "rug-002"] })
        .violated,
    ).toBe(false);
  });
});

describe("Rule 3 — no valuations or authenticity guarantees", () => {
  const flagged = [
    "This is guaranteed authentic.",
    "Definitely Persian.",
    "100% silk.",
    "We can certify the age.",
    "Appraised at over $5,000.",
  ];
  for (const s of flagged) {
    it(`flags: "${s}"`, () => {
      expect(hasValuationClaim(s).violated).toBe(true);
    });
  }
  it("passes hedged language", () => {
    expect(hasValuationClaim("This appears to be a village Heriz from the late 19th century.").violated).toBe(false);
  });
});

describe("Rule 4 — no risky DIY on valuable pieces", () => {
  const risky = [
    "You can spot-clean your silk rug with white vinegar.",
    "Just hose down the antique Persian on the deck.",
    "Steam-clean the Tabriz at home; it's fine.",
    "Machine wash the vintage Heriz on cold.",
  ];
  for (const s of risky) {
    it(`flags: "${s}"`, () => {
      expect(isRiskyDiyAdvice(s).violated).toBe(true);
    });
  }
  it("passes generic vacuum advice on a modern wool rug", () => {
    expect(isRiskyDiyAdvice("Use suction only when vacuuming your rug; turn off the beater bar.").violated).toBe(false);
  });
});

describe("End-to-end scan", () => {
  it("collects multiple findings from a single string", () => {
    const text = "This Persian is guaranteed authentic. Priced at $5,000. You can hose it down at home.";
    const findings = scanAssistantText(text);
    const rules = findings.map((f) => f.rule).sort();
    expect(rules).toEqual(["diy", "price", "valuation"]);
  });
});
