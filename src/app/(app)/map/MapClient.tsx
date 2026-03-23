"use client";

import dynamic from "next/dynamic";
import type { MapLocation } from "@/lib/locations";

const LeafletMap = dynamic(() => import("@/components/LeafletMap").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-base dark:bg-[#0a0a0a]">
      <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

interface MapClientProps {
  locations: MapLocation[];
  focusSlug?: string;
}

export function MapClient({ locations, focusSlug }: MapClientProps) {
  return <LeafletMap locations={locations} focusSlug={focusSlug} />;
}
