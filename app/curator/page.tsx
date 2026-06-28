import Link from "next/link";
import { listSeeds, slugFor } from "@/lib/curator/store";

/** Index page — table of every rug with No., title, status, edit link. */
export default async function CuratorIndex({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "all";
  const all = await listSeeds();
  const seeds = filter === "draft" ? all.filter((s) => s.draft)
    : filter === "published" ? all.filter((s) => !s.draft)
    : all;
  const counts = {
    all: all.length,
    published: all.filter((s) => !s.draft).length,
    draft: all.filter((s) => s.draft).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl text-ink">All rugs</h1>
        <p className="mt-2 text-sm text-ink-700">
          {counts.all} total · {counts.published} published · {counts.draft} draft
        </p>
      </div>

      <nav className="flex gap-2 text-xs">
        {(["all", "published", "draft"] as const).map((f) => (
          <Link
            key={f}
            href={`/curator?filter=${f}`}
            className={`px-3 py-1.5 rounded-full border ${
              filter === f
                ? "bg-ink text-cream border-ink"
                : "text-ink-700 border-ink-300 hover:border-ink"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </Link>
        ))}
      </nav>

      <table className="w-full text-sm">
        <thead className="text-left text-ink-500 text-[11px] tracking-wide-2 uppercase border-b border-ink-300/60">
          <tr>
            <th className="py-2 pr-4">No.</th>
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Origin · Region</th>
            <th className="py-2 pr-4">Size</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {seeds.map((s) => (
            <tr key={s.id} className="border-b border-ink-300/30 hover:bg-cream">
              <td className="py-2.5 pr-4 text-ink-500 font-mono text-xs">{s.id}</td>
              <td className="py-2.5 pr-4 text-ink font-medium">{s.title}</td>
              <td className="py-2.5 pr-4 text-ink-700">
                {s.origin}
                {s.region ? ` · ${s.region}` : ""}
              </td>
              <td className="py-2.5 pr-4 text-ink-700">{s.size}</td>
              <td className="py-2.5 pr-4">
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] tracking-wide-2 uppercase rounded ${
                    s.draft ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                  }`}
                >
                  {s.draft ? "Draft" : "Published"}
                </span>
              </td>
              <td className="py-2.5">
                <Link
                  href={`/curator/${slugFor(s)}`}
                  className="text-xs underline underline-offset-4 decoration-ink-300 hover:decoration-ink"
                >
                  Edit →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pt-6 border-t border-ink-300/40">
        <Link
          href="/api/curator/export"
          className="text-xs underline underline-offset-4 decoration-ink-300 hover:decoration-ink"
        >
          Export full seeds JSON ↓
        </Link>
        <p className="mt-1 text-[11px] text-ink-500">
          Edits write directly to the Sanity dataset. Public site reflects changes within ~30s
          (catalog cache TTL). The export is a manual snapshot for backup.
        </p>
      </div>
    </div>
  );
}
