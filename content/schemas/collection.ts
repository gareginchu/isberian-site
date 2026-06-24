export const collectionSchema = {
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (R: any) => R.required() },
    { name: "slug", type: "slug", options: { source: "title" } },
    { name: "description", type: "text", rows: 3 },
  ],
};
