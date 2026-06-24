# Content (Sanity Studio)

This directory holds the schemas and config for the Sanity Studio. The Studio itself is not bundled
in the main install — to run it, install `sanity` + `@sanity/vision` as devDependencies here and
run `pnpm dlx sanity dev` from this directory after setting `NEXT_PUBLIC_SANITY_PROJECT_ID`.

Until the project is provisioned, the catalog, FAQ, care, and journal adapters in `/lib/*` fall
back to fixtures so the entire site is exercisable without Sanity.
