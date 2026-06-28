"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Seed } from "@/lib/curator/store";

/** Inline editor for one rug's AI-drafted + scraped fields. SKU (id) is never
 *  exposed as editable. Save POSTs to /api/curator/save; on success, the
 *  router refreshes so the next view shows the new state. */
export function EditForm({ seed }: { seed: Seed }) {
  const router = useRouter();
  const [s, setS] = useState<Seed>(seed);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function field<K extends keyof Seed>(k: K, v: Seed[K]) {
    setS((cur) => ({ ...cur, [k]: v }));
  }

  function setPalette(idx: number, k: "name" | "hex" | "weight", v: string) {
    setS((cur) => {
      const palette = [...cur.enrichment.colorPalette];
      palette[idx] = { ...palette[idx], [k]: v };
      return { ...cur, enrichment: { ...cur.enrichment, colorPalette: palette } };
    });
  }
  function addPaletteEntry() {
    setS((cur) => ({
      ...cur,
      enrichment: {
        ...cur.enrichment,
        colorPalette: [...cur.enrichment.colorPalette, { name: "", hex: "#000000", weight: "accent" }],
      },
    }));
  }
  function removePaletteEntry(idx: number) {
    setS((cur) => ({
      ...cur,
      enrichment: { ...cur.enrichment, colorPalette: cur.enrichment.colorPalette.filter((_, i) => i !== idx) },
    }));
  }

  function setArray(k: "designFeatures" | "distinguishing", idx: number, v: string) {
    setS((cur) => {
      const arr = [...cur.enrichment[k]];
      arr[idx] = v;
      return { ...cur, enrichment: { ...cur.enrichment, [k]: arr } };
    });
  }
  function addArrayEntry(k: "designFeatures" | "distinguishing") {
    setS((cur) => ({
      ...cur,
      enrichment: { ...cur.enrichment, [k]: [...cur.enrichment[k], ""] },
    }));
  }
  function removeArrayEntry(k: "designFeatures" | "distinguishing", idx: number) {
    setS((cur) => ({
      ...cur,
      enrichment: { ...cur.enrichment, [k]: cur.enrichment[k].filter((_, i) => i !== idx) },
    }));
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/curator/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: seed.id, patch: s }),
    });
    setSaving(false);
    if (res.ok) {
      const j = await res.json();
      setStatus(j.tmp ? "Saved to /tmp (Vercel) — export and commit to persist" : "Saved");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setStatus(`Save failed — ${j.error ?? res.statusText}`);
    }
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <Section label="Title & status">
        <Row label="Title">
          <input className={ipt} value={s.title} onChange={(e) => field("title", e.target.value)} />
        </Row>
        <Row label="Collection">
          <input className={ipt} value={s.collection ?? ""} onChange={(e) => field("collection", e.target.value)} />
        </Row>
        <Row label="Draft">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.draft}
              onChange={(e) => field("draft", e.target.checked)}
            />
            <span className="text-ink-700">Draft (won&apos;t appear on /rugs)</span>
          </label>
        </Row>
      </Section>

      <Section label="Provenance & specs">
        <Row label="Size">
          <input className={ipt} value={s.size} onChange={(e) => field("size", e.target.value)} />
        </Row>
        <Row label="Origin">
          <select className={ipt} value={s.origin} onChange={(e) => field("origin", e.target.value)}>
            {["Persian", "Turkish", "Caucasian", "Contemporary", "Moroccan", "Indian", "Tibetan", "Scandinavian"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Row>
        <Row label="Region">
          <input className={ipt} value={s.region ?? ""} onChange={(e) => field("region", e.target.value)} />
        </Row>
        <Row label="Age">
          <input className={ipt} value={s.age} onChange={(e) => field("age", e.target.value)} />
        </Row>
        <Row label="Technique">
          <select className={ipt} value={s.technique} onChange={(e) => field("technique", e.target.value)}>
            <option>Hand-knotted</option>
            <option>Hand-woven (flatweave)</option>
          </select>
        </Row>
        <Row label="Materials">
          <input
            className={ipt}
            value={s.materials.join(", ")}
            onChange={(e) => field("materials", e.target.value.split(",").map((m) => m.trim()).filter(Boolean))}
            placeholder="comma-separated, e.g. Wool, Silk"
          />
        </Row>
        <Row label="Pile">
          <select className={ipt} value={s.pile} onChange={(e) => field("pile", e.target.value)}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </Row>
        <Row label="Condition">
          <select className={ipt} value={s.condition} onChange={(e) => field("condition", e.target.value)}>
            <option>Excellent.</option>
            <option>Very good.</option>
            <option>Good.</option>
            <option>Some restoration noted.</option>
          </select>
        </Row>
      </Section>

      <Section label="Lead prose (one paragraph, ≤ 240 chars)">
        <textarea
          className={`${ipt} h-32 resize-y`}
          value={s.lead}
          onChange={(e) => field("lead", e.target.value)}
          maxLength={400}
        />
        <p className="text-[11px] text-ink-500">{s.lead.length} chars</p>
      </Section>

      <Section label="Color palette">
        <div className="space-y-2">
          {s.enrichment.colorPalette.map((c, i) => (
            <div key={i} className="grid grid-cols-[36px_1fr_120px_100px_30px] gap-2 items-center">
              {/* Color swatch — actual rendered color from the hex. Click opens a
                  native color picker so the editor can sample/adjust visually. */}
              <label className="relative block w-9 h-9 rounded border border-ink-300/60 overflow-hidden cursor-pointer" style={{ backgroundColor: isValidHex(c.hex) ? c.hex : undefined }}>
                <input
                  type="color"
                  value={isValidHex(c.hex) ? c.hex : "#000000"}
                  onChange={(e) => setPalette(i, "hex", e.target.value.toUpperCase())}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Pick color"
                />
                {!isValidHex(c.hex) && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-ink-500">?</span>
                )}
              </label>
              <input className={ipt} value={c.name} onChange={(e) => setPalette(i, "name", e.target.value)} placeholder="color name" />
              <input className={ipt} value={c.hex} onChange={(e) => setPalette(i, "hex", e.target.value)} placeholder="#hex" />
              <select className={ipt} value={c.weight} onChange={(e) => setPalette(i, "weight", e.target.value)}>
                <option value="primary">primary</option>
                <option value="secondary">secondary</option>
                <option value="accent">accent</option>
              </select>
              <button type="button" onClick={() => removePaletteEntry(i)} className="text-ink-500 hover:text-ink text-lg">×</button>
            </div>
          ))}
          <button type="button" onClick={addPaletteEntry} className="text-xs underline underline-offset-4 decoration-ink-300 hover:decoration-ink">
            + add color
          </button>
        </div>
      </Section>

      <Section label="Design features">
        <ArrayEditor items={s.enrichment.designFeatures} onChange={(i, v) => setArray("designFeatures", i, v)} onAdd={() => addArrayEntry("designFeatures")} onRemove={(i) => removeArrayEntry("designFeatures", i)} />
      </Section>

      <Section label="Distinguishing notes">
        <ArrayEditor items={s.enrichment.distinguishing} onChange={(i, v) => setArray("distinguishing", i, v)} onAdd={() => addArrayEntry("distinguishing")} onRemove={(i) => removeArrayEntry("distinguishing", i)} />
      </Section>

      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-cream-200/95 backdrop-blur border-t border-ink-300/40 flex items-center justify-between gap-4">
        <p className="text-xs text-ink-500">{status ?? "Edit AI-drafted fields. SKU is read-only."}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setS(seed)} className="text-xs border border-ink-300 hover:border-ink rounded px-4 py-2">Reset</button>
          <button type="submit" disabled={saving} className="text-xs bg-ink text-cream rounded px-4 py-2 hover:bg-ink-900 disabled:opacity-40">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

const ipt = "block w-full text-sm bg-white border border-ink-300/60 rounded px-3 py-2 focus:outline-none focus:border-ink";

function isValidHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s.trim());
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] tracking-wide-2 uppercase text-ink-500">{label}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-center">
      <p className="text-xs text-ink-700">{label}</p>
      <div>{children}</div>
    </div>
  );
}

function ArrayEditor({
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  items: string[];
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-[1fr_30px] gap-2 items-center">
          <input className={ipt} value={it} onChange={(e) => onChange(i, e.target.value)} />
          <button type="button" onClick={() => onRemove(i)} className="text-ink-500 hover:text-ink text-lg">×</button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="text-xs underline underline-offset-4 decoration-ink-300 hover:decoration-ink">
        + add
      </button>
    </div>
  );
}
