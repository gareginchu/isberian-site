"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const ORIGINS = ["Persian", "Turkish", "Caucasian", "Indian", "Tibetan", "Moroccan", "Scandinavian", "Contemporary"];
const COLORS = ["red", "blue", "ivory", "earth", "green", "dark"];
const SIZES = ["Scatter", "Accent", "Room", "Oversize"];
const TECHNIQUES = ["Hand-knotted", "Hand-woven (flatweave)", "Hand-tufted", "Hand-loomed"];

/** Filter sidebar — modeled on the legacy isberian.com clearance page.
 *  Search input at the top, "Your Selections" summary with Clear, then a
 *  stack of collapsible facet groups with +/- indicators. */
export function RugFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["styles", "color", "size"]));

  const toggleGroup = (k: string) => {
    setOpenGroups((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  const toggle = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    const current = next.getAll(key);
    if (current.includes(value)) {
      next.delete(key);
      current.filter((v) => v !== value).forEach((v) => next.append(key, v));
    } else {
      next.append(key, value);
    }
    next.delete("page"); // reset to page 1 on filter change
    start(() => router.replace(`/rugs?${next.toString()}`, { scroll: false }));
  };

  const has = (key: string, value: string) => params.getAll(key).includes(value);

  const clear = () => {
    setSearch("");
    start(() => router.replace("/rugs", { scroll: false }));
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (search.trim()) next.set("q", search.trim());
    else next.delete("q");
    next.delete("page");
    start(() => router.replace(`/rugs?${next.toString()}`, { scroll: false }));
  };

  // Build a flat list of all active facets for "Your Selections"
  const activeFacets: { key: string; label: string; value: string }[] = [];
  for (const o of params.getAll("origin")) activeFacets.push({ key: "origin", label: o, value: o });
  for (const c of params.getAll("color")) activeFacets.push({ key: "color", label: c, value: c });
  for (const s of params.getAll("size")) activeFacets.push({ key: "size", label: s, value: s });
  for (const t of params.getAll("technique")) activeFacets.push({ key: "technique", label: t, value: t });
  const q = params.get("q");
  if (q) activeFacets.push({ key: "q", label: `"${q}"`, value: q });

  return (
    <aside aria-label="Filter rugs" className="lg:sticky lg:top-32 lg:self-start space-y-5 text-sm">
      {/* Search */}
      <form onSubmit={submitSearch}>
        <label htmlFor="rug-search" className="text-[10px] tracking-wide-3 uppercase text-ink-500">
          Search
        </label>
        <div className="relative mt-2">
          <input
            id="rug-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tabriz, ivory…"
            className="w-full bg-white border border-ink-300/60 rounded-none pl-3 pr-9 py-2 text-sm focus:outline-none focus:border-ink"
          />
          <button type="submit" aria-label="Search" className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center text-ink-500 hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </form>

      {/* Your selections */}
      <FacetGroup
        label="Your Selections"
        open={openGroups.has("selections")}
        onToggle={() => toggleGroup("selections")}
      >
        {activeFacets.length === 0 ? (
          <p className="text-ink-500 italic">None</p>
        ) : (
          <ul className="space-y-1.5">
            {activeFacets.map((f) => (
              <li key={`${f.key}-${f.value}`}>
                <button
                  type="button"
                  onClick={() => (f.key === "q" ? clear() : toggle(f.key, f.value))}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-700 hover:text-oxblood"
                >
                  <span aria-hidden>×</span> {f.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={clear} className="mt-3 inline-block text-xs bg-oxblood text-cream px-3 py-1.5 hover:bg-oxblood/90">
          Clear
        </button>
      </FacetGroup>

      <FacetGroup label="By Styles" open={openGroups.has("styles")} onToggle={() => toggleGroup("styles")}>
        <Checkboxes options={TECHNIQUES} onToggle={(v) => toggle("technique", v)} isActive={(v) => has("technique", v)} />
      </FacetGroup>

      <FacetGroup label="By Color" open={openGroups.has("color")} onToggle={() => toggleGroup("color")}>
        <Checkboxes options={COLORS} onToggle={(v) => toggle("color", v)} isActive={(v) => has("color", v)} />
      </FacetGroup>

      <FacetGroup label="By Size" open={openGroups.has("size")} onToggle={() => toggleGroup("size")}>
        <Checkboxes options={SIZES} onToggle={(v) => toggle("size", v)} isActive={(v) => has("size", v)} />
      </FacetGroup>

      <FacetGroup label="By Origin" open={openGroups.has("origin")} onToggle={() => toggleGroup("origin")}>
        <Checkboxes options={ORIGINS} onToggle={(v) => toggle("origin", v)} isActive={(v) => has("origin", v)} />
      </FacetGroup>

      {pending && <p className="text-xs text-ink-500">Updating…</p>}
    </aside>
  );
}

function FacetGroup({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-ink-300/40 pt-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs tracking-wide-2 uppercase text-ink-700 font-medium">{label}</span>
        <span aria-hidden className="text-ink-500 text-base leading-none w-4 text-right">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3 pb-1">{children}</div>}
    </div>
  );
}

function Checkboxes({
  options,
  onToggle,
  isActive,
}: {
  options: string[];
  onToggle: (v: string) => void;
  isActive: (v: string) => boolean;
}) {
  return (
    <ul className="space-y-1.5">
      {options.map((o) => (
        <li key={o}>
          <label className="flex items-center gap-2 text-xs text-ink-700 hover:text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={isActive(o)}
              onChange={() => onToggle(o)}
              className="rounded-none border-ink-300 text-ink focus:ring-ink/30"
            />
            {o}
          </label>
        </li>
      ))}
    </ul>
  );
}
