export const journalEntrySchema = {
  name: "journalEntry",
  title: "Journal entry",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (R: any) => R.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "excerpt", title: "Excerpt", type: "text", rows: 2 },
    { name: "body", title: "Body", type: "text", rows: 16 },
    { name: "publishedAt", title: "Published", type: "datetime" },
    { name: "author", title: "Author", type: "string" },
    { name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] },
  ],
};
