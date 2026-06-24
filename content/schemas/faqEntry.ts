export const faqEntrySchema = {
  name: "faqEntry",
  title: "FAQ entry",
  type: "document",
  fields: [
    { name: "question", title: "Question", type: "string", validation: (R: any) => R.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "question" } },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["care", "materials", "sizing", "services", "logistics", "quote-process", "trade", "showroom"],
      },
    },
    { name: "answer", title: "Answer", type: "text", rows: 8 },
    {
      name: "routing",
      title: "Care routing",
      type: "string",
      options: { list: ["diy-ok", "professional-only", "inspection-required"] },
      description: "For care-related entries: required. Drives concierge routing.",
    },
    { name: "routesToHuman", title: "Routes to human", type: "boolean" },
    { name: "verified", title: "Editor-verified", type: "boolean", initialValue: false },
  ],
};
