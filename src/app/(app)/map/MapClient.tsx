"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { MapLocation } from "@/lib/locations";
import { MapBottomPanel } from "@/components/MapBottomPanel";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const layerParam = searchParams.get("layer");
  const initialLayer = layerParam === "real" ? "real" : "game";

  const [layer, setLayer] = useState<"game" | "real">(initialLayer);
  const [isDark, setIsDark] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const handleLayerChange = (newLayer: "game" | "real") => {
    setLayer(newLayer);
    const params = new URLSearchParams(searchParams.toString());
    params.set("layer", newLayer);
    router.replace(`/map?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Auto-open sheet for focused location
  useEffect(() => {
    if (focusSlug) {
      const loc = locations.find((l) => l.slug === focusSlug);
      if (loc) setSelectedLocation(loc);
    }
  }, [focusSlug]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map */}
      <LeafletMap
        key={layer}
        locations={locations}
        focusSlug={focusSlug}
        layer={layer}
        isDark={isDark}
        onPinClick={setSelectedLocation}
      />

      {/* Layer toggle */}
      <div className="absolute top-4 right-4 z-1000 flex rounded-xl overflow-hidden shadow-lg border border-foreground/10 bg-surface-card dark:bg-[#1e1e1e]">
        <button
          onClick={() => handleLayerChange("game")}
          className={`px-3 py-2 text-xs font-bold transition-colors ${
            layer === "game" ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">sports_esports</span>
          Leonida
        </button>
        <button
          onClick={() => handleLayerChange("real")}
          className={`px-3 py-2 text-xs font-bold transition-colors ${
            layer === "real" ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">public</span>
          Florida
        </button>
      </div>

      {/* Bottom panel */}
      <MapBottomPanel
        location={selectedLocation}
        currentLayer={layer}
        onLayerToggle={handleLayerChange}
      />
    </div>
  );
}
