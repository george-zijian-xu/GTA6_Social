"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const LeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false },
);

interface MiniMapModuleProps {
  locationName: string | null;
  locationSlug: string | null;
  igX?: number | null;
  igY?: number | null;
}

export function MiniMapModule({ locationName, locationSlug, igX, igY }: MiniMapModuleProps) {
  if (!locationName || !locationSlug) return null;

  const hasCoords = igX != null && igY != null;

  return (
    <Link
      href={`/map?focus=${locationSlug}`}
      className="block relative rounded-2xl overflow-hidden h-24 group cursor-pointer"
    >
      {/* Mini map or gradient placeholder */}
      {hasCoords ? (
        <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-300">
          <LeafletMap
            locations={[{ id: "", name: locationName, slug: locationSlug, category: null, igX, igY, postCount: 1 }]}
            mini
            center={[igY!, igX!]}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 opacity-50 group-hover:opacity-30 transition-opacity" />
      )}

      {/* Overlay label */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <p className="text-[0.65rem] text-foreground-muted uppercase tracking-widest font-bold drop-shadow-sm">
          {locationName}
        </p>
        <span className="mt-1.5 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm text-xs font-bold text-foreground">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          OPEN MAP
        </span>
      </div>
    </Link>
  );
}
