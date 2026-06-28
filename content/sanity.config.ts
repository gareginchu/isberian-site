// Sanity Studio config — modern v3 (defineConfig). Run `pnpm install` from
// content/, then `pnpm sanity deploy` from content/ to publish the Studio at
// https://<chosen-hostname>.sanity.studio.
//
// Project ID is hardcoded here because the Studio CLI doesn't read .env.local
// from the parent project; the project ID is public anyway (the SANITY_API_TOKEN
// in .env.local is the secret, not the project ID).
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "isberian",
  title: "Oscar Isberian Rugs",
  projectId: "72navbmn",
  dataset: "production",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
