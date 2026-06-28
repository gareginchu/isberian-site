import type { MetadataRoute } from "next";
import { listRugs } from "@/lib/catalog";
import { listFaq, listCare } from "@/lib/faq";
import { journalEntries } from "@/lib/journal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://isberian.com";
  const rugs = await listRugs();
  const faq = await listFaq();
  const care = await listCare();

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/rugs",
    "/services",
    "/services/triage",
    "/identify",
    "/trade",
    "/story",
    "/journal",
    "/visit",
    "/care",
    "/privacy",
    "/accessibility",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));

  return [
    ...staticPages,
    ...rugs.map((r) => ({ url: `${base}/rugs/${r.slug}`, lastModified: new Date(r.updatedAt) })),
    ...journalEntries.map((j) => ({ url: `${base}/journal/${j.slug}`, lastModified: new Date(j.publishedAt) })),
    ...care.map((c) => ({ url: `${base}/care/${c.slug}`, lastModified: new Date(c.updatedAt) })),
    ...faq.map((f) => ({ url: `${base}/care#${f.slug}`, lastModified: new Date(f.updatedAt) })),
  ];
}
