import { createClient, type SanityClient } from "@sanity/client";

/**
 * Read-only Sanity client. When NEXT_PUBLIC_SANITY_PROJECT_ID is set, callers can fetch live
 * content; until then, /lib/catalog and /lib/faq fall back to fixtures so the surface above
 * (pages, concierge, evals) is exercisable without provisioning Sanity.
 */
let _client: SanityClient | null = null;

export function sanity(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return null;
  if (_client) return _client;
  _client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-12-01",
    // useCdn:false because new Sanity projects ship with the dataset marked
    // private, and the CDN doesn't authenticate. SanityCatalogSource has its
    // own 30s in-memory cache so the latency cost is negligible. Flip to
    // useCdn:true once the dataset is made public in sanity.io → Settings.
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });
  return _client;
}
