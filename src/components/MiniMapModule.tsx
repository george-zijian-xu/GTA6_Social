"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { PostType } from "@/lib/post";

const LeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false },
);

interface MiniMapModuleProps {
  locationName: string | null;
  locationSlug: string | null;
  igX?: number | null;
  igY?: number | null;
  rlLat?: number | null;
  rlLng?: number | null;
  postType?: PostType | null;
}

/** Derive the default map layer from the post type's second letter. */
function defaultLayerFor(postType: PostType | null | undefined): "game" | "real" {
  if (!postType || postType === "NON_CANON") return "game";
  return postType[1] === "G" ? "game" : "real";
}

export function MiniMapModule({
  locationName,
  locationSlug,
  igX,
  igY,
  rlLat,
  rlLng,
  postType,
}: MiniMapModuleProps) {
  const router = useRouter();

  // NON_CANON or no location → hidden
  if (!locationName || !locationSlug || postType === "NON_CANON") return null;

  const hasGame = igX != null && igY != null;
  const hasReal = rlLat != null && rlLng != null;
  const hasBoth = hasGame && hasReal;

  const [layer, setLayer] = useState<"game" | "real">(defaultLayerFor(postType));

  const showMap = layer === "game" ? hasGame : hasReal;

  const locationForMap = showMap
    ? [{
        id: "",
        name: locationName,
        slug: locationSlug,
        category: null,
        igX: igX ?? null,
        igY: igY ?? null,
        rlLat: rlLat ?? null,
        rlLng: rlLng ?? null,
        description: null,
        postCount: 1,
      }]
    : [];

  const mapCenter: [number, number] | undefined =
    layer === "game" && hasGame ? [igY!, igX!] :
    layer === "real" && hasReal ? [rlLat!, rlLng!] :
    undefined;

  return (
    <div
      onClick={() => router.push(`/map?focus=${locationSlug}&layer=${layer}`)}
      className="relative rounded-2xl overflow-hidden h-24 cursor-pointer group"
    >
      {/* Map or gradient placeholder */}
      {showMap ? (
        <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-300">
          <LeafletMap
            locations={locationForMap}
            mini
            layer={layer}
            center={mapCenter}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 opacity-50 group-hover:opacity-30 transition-opacity" />
      )}

      {/* Location name */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <p className="text-[0.65rem] text-white uppercase tracking-widest font-bold drop-shadow-sm bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {locationName}
        </p>
      </div>

      {/* Dual toggle — only shown when location has both coord types */}
      {hasBoth && (
        <div
          className="absolute top-2 right-2 z-20 flex rounded-lg overflow-hidden shadow border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setLayer("game")}
            className={`px-2 py-0.5 text-[9px] font-bold transition-colors ${
              layer === "game" ? "bg-primary text-white" : "bg-black/40 text-white/70 hover:text-white"
            }`}
          >
            G
          </button>
          <button
            onClick={() => setLayer("real")}
            className={`px-2 py-0.5 text-[9px] font-bold transition-colors ${
              layer === "real" ? "bg-primary text-white" : "bg-black/40 text-white/70 hover:text-white"
            }`}
          >
            R
          </button>
        </div>
      )}
    </div>
  );
}
