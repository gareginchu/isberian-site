export const careGuideSchema = {
  name: "careGuide",
  title: "Care guide",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (R: any) => R.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "excerpt", title: "Excerpt", type: "text", rows: 2 },
    { name: "body", title: "Body (markdown)", type: "text", rows: 12 },
    {
      name: "routing",
      title: "Routing",
      type: "string",
      options: { list: ["diy-ok", "professional-only", "inspection-required"] },
    },
    {
      name: "related",
      title: "Related entries",
      type: "array",
      of: [{ type: "reference", to: [{ type: "faqEntry" }] }],
    },
  ],
};
