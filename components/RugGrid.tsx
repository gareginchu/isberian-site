import type { Rug } from "@/lib/types/rug";
import { RugCard } from "./RugCard";

export function RugGrid({ rugs }: { rugs: Rug[] }) {
  if (rugs.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="display text-2xl text-ink">No pieces match these filters.</p>
        <p className="mt-3 text-sm text-ink-500">
          We rotate the catalog frequently. Tell us what you're looking for and we'll bring out what isn't on the floor.
        </p>
      </div>
    );
  }
  return (
    <ul role="list" className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
      {rugs.map((rug, i) => (
        <li key={rug.id}>
          <RugCard rug={rug} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
