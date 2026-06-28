import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { listSeeds, slugFor } from "@/lib/curator/store";
import { EditForm } from "./EditForm";

export default async function CuratorEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seeds = await listSeeds();
  const seed = seeds.find((s) => slugFor(s) === slug);
  if (!seed) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-wide-2 uppercase text-ink-500">
            No. {seed.id} · {seed.draft ? "Draft" : "Published"}
          </p>
          <h1 className="display text-2xl text-ink mt-2">{seed.title}</h1>
        </div>
        <Link href="/curator" className="text-xs text-ink-500 hover:text-ink underline underline-offset-4">
          ← Back to all rugs
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-10">
        <div>
          <div className="relative aspect-square bg-cream border border-ink-300/40">
            <Image
              src={`/rugs/${seed.id}.jpg`}
              alt={seed.title}
              fill
              sizes="(min-width: 1024px) 33vw, 90vw"
              className="object-contain p-2"
            />
          </div>
          {seed.suggestedRoomUrl && (
            <div className="mt-4 relative aspect-[3/2] bg-cream border border-ink-300/40 overflow-hidden">
              <Image
                src={seed.suggestedRoomUrl}
                alt={`Suggested setting for ${seed.title}`}
                fill
                sizes="(min-width: 1024px) 33vw, 90vw"
                className="object-cover"
              />
              <p className="absolute bottom-2 left-2 text-[10px] tracking-wide-2 uppercase text-cream bg-ink/70 px-2 py-1">
                Suggested setting
              </p>
            </div>
          )}
        </div>

        <EditForm seed={seed} />
      </div>
    </div>
  );
}
