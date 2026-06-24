"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const ORIGINS = ["Persian", "Turkish", "Caucasian", "Indian", "Tibetan", "Moroccan", "Scandinavian", "Contemporary"];
const COLORS = ["red", "blue", "ivory", "earth", "green", "dark"];
const SIZES = ["Scatter", "Accent", "Room", "Oversize"];
const TECHNIQUES = ["Hand-knotted", "Hand-woven (flatweave)", "Hand-tufted", "Hand-loomed"];

export function RugFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const toggle = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    const current = next.getAll(key);
    if (current.includes(value)) {
      next.delete(key);
      current.filter((v) => v !== value).forEach((v) => next.append(key, v));
    } else {
      next.append(key, value);
    }
    start(() => router.replace(`/rugs?${next.toString()}`, { scroll: false }));
  };

  const has = (key: string, value: string) => params.getAll(key).includes(value);

  const clear = () => {
    start(() => router.replace("/rugs", { scroll: false }));
  };

  return (
    <aside aria-label="Filter rugs" className="lg:sticky lg:top-24 lg:self-start">
      <p className="eyebrow">Filter</p>
      <FilterGroup label="Origin">
        {ORIGINS.map((o) => (
          <Chip key={o} active={has("origin", o)} onClick={() => toggle("origin", o)}>
            {o}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Color">
        {COLORS.map((c) => (
          <Chip key={c} active={has("color", c)} onClick={() => toggle("color", c)}>
            {c}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Size">
        {SIZES.map((s) => (
          <Chip key={s} active={has("size", s)} onClick={() => toggle("size", s)}>
            {s}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Technique">
        {TECHNIQUES.map((t) => (
          <Chip key={t} active={has("technique", t)} onClick={() => toggle("technique", t)}>
            {t}
          </Chip>
        ))}
      </FilterGroup>
      <div className="mt-6 flex items-center gap-4 text-sm">
        <button onClick={clear} className="text-oxblood hover:underline">
          Clear all
        </button>
        {pending && <span className="text-ink-500">Updating…</span>}
      </div>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-xs tracking-wide-2 uppercase text-ink-500 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "px-3 py-1.5 text-xs tracking-wide-2 border transition-colors " +
        (active
          ? "bg-oxblood text-cream border-oxblood"
          : "bg-transparent text-ink-700 border-ink-300/60 hover:border-oxblood")
      }
    >
      {children}
    </button>
  );
}
