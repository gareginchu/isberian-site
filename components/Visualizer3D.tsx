"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useState } from "react";
import * as THREE from "three";
import Image from "next/image";
import Link from "next/link";
import { ROOMS, type Room } from "@/lib/visualizer/rooms";
import { parseRugSizeFt } from "@/lib/visualizer/transform";
import type { Rug } from "@/lib/types/rug";

/**
 * 3D-rendered visualizer. Renders each room photo as a back-plane inside a
 * 3D scene; the rug is a textured plane on a virtual floor with real lighting
 * + shadow casting. Per-room camera, light, and floor color come from the
 * room metadata (lib/visualizer/rooms.ts).
 */

type Props = {
  rugs: Rug[];
  initialRoomSlug?: string;
  initialRugId?: string;
};

function RugOnFloor({ rug, room }: { rug: Rug; room: Room }) {
  const rugImage = rug.images.find((i) => i.primary) ?? rug.images[0];
  const texture = useLoader(THREE.TextureLoader, rugImage?.src ?? "");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  // Rug occupies a fraction of the floor proportional to its real-world size.
  // The virtual floor is `floorWidthFt × floorDepthFt` feet, scaled to fit the
  // scene's `sizeUnits` extent.
  const { widthFt, depthFt } = parseRugSizeFt(rug.description.details.sizeImperial);
  const sizeUnits = 5;
  const rugW = (widthFt / room.scene3d.floorWidthFt) * sizeUnits;
  const rugD = (depthFt / room.scene3d.floorDepthFt) * sizeUnits;

  return (
    <mesh
      position={[0, 0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    >
      <planeGeometry args={[rugW, rugD]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0} />
    </mesh>
  );
}

function FloorPlane({ color }: { color: string }) {
  return (
    <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function BackgroundPhoto({ src, aspect }: { src: string; aspect: number }) {
  const texture = useLoader(THREE.TextureLoader, src);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Back-plane sized to roughly fill the camera view at z=-5. Aspect = W/H.
  const h = 10;
  const w = h * aspect;
  return (
    <mesh position={[0, 1.5, -5]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Scene({ rug, room }: { rug: Rug; room: Room }) {
  const aspect = room.width / room.height;
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={room.scene3d.lightPos}
        intensity={room.scene3d.lightIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <BackgroundPhoto src={room.src} aspect={aspect} />
      <FloorPlane color={room.scene3d.floorColor} />
      <Suspense fallback={null}>
        <RugOnFloor rug={rug} room={room} />
      </Suspense>
    </>
  );
}

export function Visualizer3D({ rugs, initialRoomSlug = "bedroom", initialRugId }: Props) {
  const [roomSlug, setRoomSlug] = useState(initialRoomSlug);
  const [rugId, setRugId] = useState(initialRugId ?? rugs[0]?.id);

  const room: Room = ROOMS.find((r) => r.slug === roomSlug) ?? ROOMS[0];
  const rug = rugs.find((r) => r.id === rugId) ?? rugs[0];

  // Aspect ratio of the canvas matches the room photo's aspect ratio.
  const aspect = `${room.width} / ${room.height}`;

  return (
    <div className="space-y-6">
      {/* Room picker */}
      <div>
        <p className="eyebrow mb-2">Choose a room</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ROOMS.map((r) => (
            <button
              key={r.slug}
              type="button"
              onClick={() => setRoomSlug(r.slug)}
              aria-pressed={r.slug === roomSlug}
              className={
                "min-w-[120px] px-3 py-2 text-sm border transition-colors " +
                (r.slug === roomSlug
                  ? "border-ink bg-ink text-cream"
                  : "border-ink-300 text-ink hover:border-ink")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative w-full bg-cream-200 border border-ink-300/60 overflow-hidden"
        style={{ aspectRatio: aspect }}
        key={room.slug}
      >
        <Canvas
          camera={{
            position: room.scene3d.cameraPos,
            fov: room.scene3d.cameraFov,
            near: 0.1,
            far: 100,
          }}
          shadows
          dpr={[1, 2]}
          onCreated={(state) => {
            state.camera.lookAt(...room.scene3d.cameraTarget);
            state.camera.updateProjectionMatrix();
          }}
        >
          {rug && <Scene rug={rug} room={room} />}
        </Canvas>
      </div>

      <p className="text-xs text-ink-500 leading-relaxed max-w-prose">
        {room.notes ?? room.description}
      </p>

      <div>
        <p className="eyebrow mb-2">Choose a rug from the floor</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {rugs.slice(0, 24).map((r) => {
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
            <p className="eyebrow">Selected piece · No. {rug.id}</p>
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
