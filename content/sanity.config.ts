// Sanity Studio config stub. Activate by installing `sanity` + `@sanity/vision` and running
// `pnpm dlx sanity dev` from this directory. The site reads via lib/sanity/client.ts; until the
// project is provisioned, the catalog and FAQ adapters fall back to fixtures in /lib/*.

import { schemaTypes } from "./schemas";

export default {
  name: "isberian",
  title: "Oscar Isberian Rugs — Studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  schema: { types: schemaTypes },
};
