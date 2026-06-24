// Sanity schema stub for the structured RugDescription. Mirrors lib/types/rug.ts.
// To activate, install `sanity` + run `sanity dev` from /content with sanity.config.ts.

export const rugDescriptionSchema = {
  name: "rugDescription",
  title: "Rug — structured description",
  type: "object",
  fields: [
    { name: "lead", title: "Lead", type: "text", rows: 3, validation: (R: any) => R.required().max(240) },
    {
      name: "details",
      title: "Details",
      type: "object",
      fields: [
        { name: "sizeImperial", title: "Size (imperial)", type: "string" },
        { name: "sizeMetric", title: "Size (metric)", type: "string" },
        { name: "technique", title: "Technique", type: "string" },
        { name: "materials", title: "Materials", type: "array", of: [{ type: "string" }] },
        { name: "pile", title: "Pile", type: "string", options: { list: ["Low", "Medium", "High"] } },
        {
          name: "knotDensity",
          title: "Knot density",
          type: "object",
          fields: [
            { name: "knotsPerSqIn", type: "number" },
            { name: "verified", type: "boolean", description: "Editor must confirm before publish." },
          ],
        },
        {
          name: "age",
          title: "Age",
          type: "object",
          fields: [
            { name: "circa", type: "string" },
            { name: "verified", type: "boolean" },
          ],
        },
        { name: "condition", title: "Condition", type: "string" },
      ],
    },
    {
      name: "colorPalette",
      title: "Color palette",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", type: "string" },
            { name: "hex", type: "string" },
            { name: "weight", type: "string", options: { list: ["primary", "secondary", "accent"] } },
          ],
        },
      ],
    },
    { name: "designFeatures", title: "Design features", type: "array", of: [{ type: "string" }] },
    { name: "distinguishing", title: "Distinguishing", type: "array", of: [{ type: "string" }] },
    {
      name: "provenance",
      title: "Provenance",
      type: "object",
      fields: [
        { name: "origin", type: "string" },
        { name: "region", type: "string" },
        { name: "weaver", type: "string" },
        { name: "verified", type: "boolean" },
        { name: "note", type: "text", rows: 2 },
      ],
    },
  ],
};
