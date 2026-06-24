import type Anthropic from "@anthropic-ai/sdk";

/**
 * Tool definitions for the concierge loop. The shapes here are the contract; their implementations
 * live in /lib/search, /lib/faq, /lib/catalog, /lib/leads, /lib/booking and are wired by the
 * orchestrator. Keep this list lean — every tool widens the model's surface and the eval matrix.
 */

export const tools: Anthropic.Messages.Tool[] = [
  {
    name: "search_inventory",
    description:
      "Hybrid semantic + facet search over the Isberian catalog. ALWAYS call this before naming a specific rug. Returns at most 8 real records — never invent more.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural-language description of what the user wants." },
        filters: {
          type: "object",
          properties: {
            origin: { type: "array", items: { type: "string" } },
            colorFamily: { type: "array", items: { type: "string" } },
            sizeBand: { type: "array", items: { type: "string" } },
            technique: { type: "array", items: { type: "string" } },
          },
        },
        limit: { type: "number", description: "Default 6, max 8." },
      },
      required: ["query"],
    },
  },
  {
    name: "answer_faq",
    description:
      "Retrieval over the curated FAQ + care knowledge base. Use for any question about care, materials, sizing, services, logistics, or the quote process. Returns the matched entry with answer + routing. Do not improvise care advice; cite the entry.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        category: {
          type: "string",
          enum: ["care", "materials", "sizing", "services", "logistics", "quote-process", "trade", "showroom"],
        },
      },
      required: ["query"],
    },
  },
  {
    name: "find_similar",
    description:
      "Visual-similarity over rug image embeddings. Use only after the user has chosen a specific rug, for 'more like this'.",
    input_schema: {
      type: "object",
      properties: {
        rugId: { type: "string" },
        limit: { type: "number" },
      },
      required: ["rugId"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Book a showroom visit (Chicago or Evanston) via Cal.com. Returns confirmation or available alternatives. Always confirm against the real showroom hours — do not invent slots.",
    input_schema: {
      type: "object",
      properties: {
        showroom: { type: "string", enum: ["chicago", "evanston"] },
        preferredAt: { type: "string", description: "ISO 8601 datetime in America/Chicago." },
        reason: { type: "string" },
        contact: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
          },
          required: ["name", "email"],
        },
      },
      required: ["showroom", "preferredAt", "contact"],
    },
  },
  {
    name: "create_lead",
    description:
      "Consent-gated. Sends a structured lead to CRM + email. Use after the user has explicitly opted in to being contacted. Never invoke this without an explicit consent line being acknowledged in the conversation.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["quote", "visit", "wishlist", "service", "identify", "trade", "concierge"] },
        rugId: { type: "string" },
        contact: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
          },
          required: ["email"],
        },
        transcriptSummary: { type: "string" },
      },
      required: ["type", "contact"],
    },
  },
];

export type ToolName = (typeof tools)[number]["name"];
