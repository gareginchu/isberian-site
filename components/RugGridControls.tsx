"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "new", label: "Newest" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
  { value: "size-asc", label: "Size — small to large" },
  { value: "size-desc", label: "Size — large to small" },
];

const PER_PAGE_OPTIONS = [12, 24, 50];

/**
 * Sort + records-per-page + pagination controls. Modeled on the legacy
 * clearance page header: a "Search results …" title with the total count,
 * `<< < Page X of Y > >>` pagination, and right-aligned dropdowns.
 */
export function RugGridControls({
  total,
  filtered,
  page,
  pageCount,
}: {
  total: number;
  filtered: number;
  page: number;
  pageCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params.get("sort") ?? "new";
  const perPage = parseInt(params.get("perPage") ?? "24", 10);

  function setParam(k: string, v: string | null) {
    const next = new URLSearchParams(params.toString());
    if (v === null) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    router.replace(`/rugs?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4 border-b border-ink-300/40 pb-5 mb-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-[10px] tracking-wide-3 uppercase text-ink-500">Search results</p>
          <p className="display text-xl text-ink mt-1">
            {filtered === total ? `${total} pieces` : `${filtered} of ${total} pieces`}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <label className="flex items-center gap-2">
            <span className="text-ink-500 uppercase tracking-wide-2 text-[10px]">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value === "new" ? null : e.target.value)}
              className="bg-white border border-ink-300/60 px-2 py-1.5 text-xs focus:outline-none focus:border-ink"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-ink-500 uppercase tracking-wide-2 text-[10px]">Per page</span>
            <select
              value={perPage}
              onChange={(e) => setParam("perPage", e.target.value === "24" ? null : e.target.value)}
              className="bg-white border border-ink-300/60 px-2 py-1.5 text-xs focus:outline-none focus:border-ink"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {pageCount > 1 && (
        <Pagination page={page} pageCount={pageCount} setParam={setParam} />
      )}
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  setParam,
}: {
  page: number;
  pageCount: number;
  setParam: (k: string, v: string | null) => void;
}) {
  const goto = (n: number) => setParam("page", n === 1 ? null : String(n));
  return (
    <nav aria-label="Pagination" className="flex items-center gap-2 text-xs text-ink-700">
      <PageButton onClick={() => goto(1)} disabled={page === 1} label="First">«</PageButton>
      <PageButton onClick={() => goto(page - 1)} disabled={page === 1} label="Previous">‹</PageButton>
      <span className="px-2">
        Page <strong className="text-ink">{page}</strong> of {pageCount}
      </span>
      <PageButton onClick={() => goto(page + 1)} disabled={page === pageCount} label="Next">›</PageButton>
      <PageButton onClick={() => goto(pageCount)} disabled={page === pageCount} label="Last">»</PageButton>
    </nav>
  );
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex items-center justify-center w-7 h-7 border border-ink-300/60 text-ink-700 hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
