"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Image from "next/image";
import Link from "next/link";
import { ROOMS, type Room } from "@/lib/visualizer/rooms";
import { parseRugSizeFt } from "@/lib/visualizer/transform";
import type { Rug } from "@/lib/types/rug";

/**
 * 3D-rendered visualizer (v0 spike). Renders the room photo as a back-plane
 * inside a 3D scene; the rug is a textured plane sitting on a virtual floor
 * with real lighting + shadow casting. The visible improvement vs the CSS
 * matrix3d version: actual depth-aware shadows, real perspective via a 3D
 * camera, and the door open to interactive features (drag/rotate/scale).
 *
 * V0 scope: bedroom only, no interaction. Goal is to see if the realism gap
 * actually closes before extending to all rooms.
 */

type Props = {
  rugs: Rug[];
  initialRugId?: string;
};

// Bedroom photo dims, used for the back-plane aspect ratio.
const ROOM_W = 3800;
const ROOM_H = 2533;

function RugOnFloor({ rug, room }: { rug: Rug; room: Room }) {
  const rugImage = rug.images.find((i) => i.primary) ?? rug.images[0];
  const texture = useLoader(THREE.TextureLoader, rugImage?.src ?? "");
  // Make the rug's pixels render unfiltered-ish — sharper for woven detail.
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  // The rug occupies a portion of the virtual floor proportional to its real-world
  // size vs the room's real dimensions.
  const { widthFt, depthFt } = parseRugSizeFt(rug.description.details.sizeImperial);
  const roomW = room.realDimensions.widthFt;
  const roomD = room.realDimensions.depthFt;
  const sizeUnits = 5; // floor extent in scene units (5x5 unit floor)
  const rugW = (widthFt / roomW) * sizeUnits;
  const rugD = (depthFt / roomD) * sizeUnits;

  return (
    <mesh
      position={[0, 0.005, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    >
      <planeGeometry args={[rugW, rugD]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0} />
    </mesh>
  );
}

function FloorPlane() {
  return (
    <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#d8c7a8" roughness={0.95} />
    </mesh>
  );
}

function BackgroundPhoto({ src }: { src: string }) {
  const texture = useLoader(THREE.TextureLoader, src);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh position={[0, 1.5, -5]}>
      <planeGeometry args={[(10 * ROOM_W) / ROOM_H, 10]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Scene({ rug, room }: { rug: Rug; room: Room }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      {/* Window light from the left, matching the bedroom photo's window. */}
      <directionalLight
        position={[-3, 5, 2]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <BackgroundPhoto src={room.src} />
      <FloorPlane />
      <Suspense fallback={null}>
        <RugOnFloor rug={rug} room={room} />
      </Suspense>
    </>
  );
}

export function Visualizer3D({ rugs, initialRugId }: Props) {
  const room = ROOMS.find((r) => r.slug === "bedroom") ?? ROOMS[0];
  const [rugId, setRugId] = useState(initialRugId ?? rugs[0]?.id);
  const rug = rugs.find((r) => r.id === rugId) ?? rugs[0];

  return (
    <div className="space-y-6">
      <div className="relative aspect-[3800/2533] bg-cream-200 border border-ink-300/60 overflow-hidden">
        <Canvas
          camera={{ position: [0, 1.6, 4], fov: 35, near: 0.1, far: 100 }}
          shadows
          dpr={[1, 2]}
        >
          {rug && <Scene rug={rug} room={room} />}
        </Canvas>
      </div>

      {/* Rug picker */}
      <div>
        <p className="eyebrow mb-2">Choose a rug from the floor</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {rugs.slice(0, 18).map((r) => {
            const img = r.images.find((i) => i.primary) ?? r.images[0];
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRugId(r.id)}
                aria-pressed={r.id === rugId}
                title={r.title}
                className={
                  "aspect-square relative overflow-hidden border transition-colors " +
                  (r.id === rugId
                    ? "border-ink ring-2 ring-ink/40"
                    : "border-ink-300 hover:border-ink")
                }
              >
                {img && (
                  <Image
                    src={img.src}
                    alt={r.title}
                    fill
                    sizes="(min-width: 1024px) 12vw, 30vw"
                    className="object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {rug && (
        <div className="border-t border-ink-300/60 pt-6 flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Selected piece</p>
            <p className="display text-2xl text-ink mt-1">{rug.title}</p>
            <p className="text-sm text-ink-500 mt-1">
              {rug.description.provenance.origin}
              {rug.description.details.sizeImperial ? ` · ${rug.description.details.sizeImperial}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/rugs/${rug.slug}`}
              className="inline-flex items-center justify-center border border-ink text-ink px-5 py-2.5 text-sm tracking-wide-2 hover:bg-ink hover:text-cream transition-colors"
            >
              See the rug page
            </Link>
            <Link
              href={`/visit?rug=${encodeURIComponent(rug.id)}`}
              className="inline-flex items-center justify-center bg-ink text-cream px-5 py-2.5 text-sm tracking-wide-2 hover:bg-ink-900 transition-colors"
            >
              Request a quote on this rug
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
