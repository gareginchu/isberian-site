// Top-level Rug document schema. Mirrors lib/types/rug.ts. Used by the editor
// review queue: AI-drafted entries land here as documents an editor opens in
// Sanity Studio, verifies fields, and publishes. Verified data is then
// synced back to lib/catalog/fixtures.ts (script: sync-from-sanity.ts).

export const rugSchema = {
  name: "rug",
  title: "Rug",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (R: any) => R.required().max(120),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R: any) => R.required(),
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["available", "on-memo", "sold", "draft"] },
      initialValue: "available",
    },
    {
      name: "collection",
      title: "Collection",
      type: "reference",
      to: [{ type: "collection" }],
    },
    {
      name: "description",
      title: "Structured description",
      type: "rugDescription",
      validation: (R: any) => R.required(),
    },
    {
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "src", type: "string", title: "URL or /public path" },
            { name: "alt", type: "string", title: "Alt text" },
            { name: "primary", type: "boolean", title: "Primary image" },
          ],
        },
      ],
      validation: (R: any) => R.required().min(1),
    },
    {
      name: "draft",
      title: "Hide from public catalog",
      type: "boolean",
      initialValue: false,
      description: "Drafts are excluded from listRugs(). Used as a publish gate separate from per-field verified flags.",
    },
    {
      name: "reviewStatus",
      title: "Editor review",
      type: "string",
      options: { list: ["needs-review", "in-review", "approved", "rejected"] },
      initialValue: "needs-review",
      description: "AI-drafted entries enter as 'needs-review'. An approval here is what flips the per-field verified flags to true during sync-back.",
    },
    {
      name: "reviewNotes",
      title: "Review notes",
      type: "text",
      rows: 3,
      description: "What the editor changed and why. Kept with the document for audit.",
    },
  ],
  preview: {
    select: { title: "title", status: "reviewStatus", media: "images.0.src" },
    prepare({ title, status }: { title: string; status?: string }) {
      return { title, subtitle: status ?? "needs-review" };
    },
  },
};
