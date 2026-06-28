import type { RugDescription } from "@/lib/types/rug";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-ink-300/40 last:border-b-0">
      <p className="eyebrow">{label}</p>
      <div className="mt-2 text-sm text-ink-700">{children}</div>
    </div>
  );
}

function UnverifiedNote({ what }: { what: string }) {
  return (
    <span
      className="ml-2 inline-flex items-center gap-1 text-[10px] tracking-wide-2 uppercase text-saddle-700"
      title="Awaiting editor verification — preliminary."
    >
      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-saddle" />
      {what} unverified
    </span>
  );
}

/**
 * Renders the structured RugDescription. Every rug page uses this — not a free-prose block.
 * Unverified origin/age/knot-count/provenance claims are surfaced with a visible label rather than
 * hidden, in line with the editorial process described in CLAUDE.md.
 */
export function RugDescriptionBlock({ d }: { d: RugDescription }) {
  return (
    <div>
      {/* Lead is body prose, not a headline — body font at editorial reading
          size (~17-19px), generous line-height. The display serif at 30px
          read like a pull-quote and competed with the H1 above. */}
      <p className="text-base lg:text-lg text-ink-700 leading-relaxed max-w-prose">{d.lead}</p>
      <div className="mt-8">
        <Section label="Details">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
            <li><strong className="text-oxblood">Size</strong> · {d.details.sizeImperial} ({d.details.sizeMetric})</li>
            <li><strong className="text-oxblood">Technique</strong> · {d.details.technique}</li>
            <li><strong className="text-oxblood">Materials</strong> · {d.details.materials.join(", ")}</li>
            <li><strong className="text-oxblood">Pile</strong> · {d.details.pile}</li>
            {d.details.knotDensity && (
              <li>
                <strong className="text-oxblood">Knot density</strong> · {d.details.knotDensity.knotsPerSqIn} knots/sq in
                {!d.details.knotDensity.verified && <UnverifiedNote what="density" />}
              </li>
            )}
            {d.details.age && (
              <li>
                <strong className="text-oxblood">Age</strong> · {d.details.age.circa}
                {!d.details.age.verified && <UnverifiedNote what="age" />}
              </li>
            )}
            {d.details.condition && (
              <li className="sm:col-span-2">
                <strong className="text-oxblood">Condition</strong> · {d.details.condition}
              </li>
            )}
          </ul>
        </Section>

        {d.colorPalette.length > 0 && (
          <Section label="Palette">
            <ul className="flex flex-wrap gap-3">
              {d.colorPalette.map((c) => (
                <li key={c.name} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden
                    className="inline-block w-5 h-5 border border-ink-300/60"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                  <span className="text-ink-500 text-xs">· {c.weight}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {d.designFeatures.length > 0 && (
          <Section label="Design">
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {d.designFeatures.map((f) => (
                <li key={f} className="text-sm">· {f}</li>
              ))}
            </ul>
          </Section>
        )}

        {d.distinguishing.length > 0 && (
          <Section label="Distinguishing">
            <ul className="space-y-1">
              {d.distinguishing.map((f) => (
                <li key={f} className="text-sm">{f}</li>
              ))}
            </ul>
          </Section>
        )}

        <Section label="Provenance">
          <p>
            {d.provenance.origin}
            {d.provenance.region ? ` · ${d.provenance.region}` : ""}
            {d.provenance.weaver ? ` · ${d.provenance.weaver}` : ""}
            {!d.provenance.verified && <UnverifiedNote what="provenance" />}
          </p>
          {d.provenance.note && <p className="mt-2 text-ink-500">{d.provenance.note}</p>}
        </Section>
      </div>
    </div>
  );
}
