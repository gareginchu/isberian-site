export type FaqCategory =
  | "care"
  | "materials"
  | "sizing"
  | "services"
  | "logistics"
  | "quote-process"
  | "trade"
  | "showroom";

export type CareRouting = "diy-ok" | "professional-only" | "inspection-required";

/**
 * One FAQ / care KB entry. Retrieval-grounded answers cite these; the concierge never improvises
 * care or material advice. For valuable/antique/silk pieces, `routing: "professional-only"` and
 * the concierge is required to route to service.
 */
export type FaqEntry = {
  id: string;
  slug: string;
  category: FaqCategory;
  question: string;
  /** Plain-text answer body. Markdown allowed for headings/lists. */
  answer: string;
  /** When this guidance is care-related, the routing decision the concierge must honor. */
  routing?: CareRouting;
  /** If this answer should escalate to a human (always true for routing=inspection-required). */
  routesToHuman: boolean;
  /** Editorial review state. */
  verified: boolean;
  updatedAt: string; // ISO
};

export type CareGuide = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // markdown
  routing: CareRouting;
  related: string[]; // slugs
  updatedAt: string;
};
