"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { MapLocation } from "@/lib/locations";
import { MapBottomPanel } from "@/components/MapBottomPanel";
import { MapSearchBar } from "@/components/MapSearchBar";
import { LeafletMap } from "@/components/LeafletMap";

interface MapClientProps {
  locations: MapLocation[];
  focusSlug?: string;
}

export function MapClient({ locations, focusSlug: initialFocusSlug }: MapClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const layerParam = searchParams.get("layer");
  const initialLayer = layerParam === "real" ? "real" : "game";

  const [layer, setLayer] = useState<"game" | "real">(initialLayer);
  const [isDark, setIsDark] = useState(false);
  const [focusedSlug, setFocusedSlug] = useState<string | undefined>(initialFocusSlug);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const handleLayerChange = (newLayer: "game" | "real") => {
    setLayer(newLayer);
    const params = new URLSearchParams(searchParams.toString());
    params.set("layer", newLayer);
    if (focusedSlug) params.set("focus", focusedSlug);
    router.replace(`/map?${params.toString()}`, { scroll: false });
  };

  const handlePinClick = useCallback((loc: MapLocation | null) => {
    if (!loc) {
      setFocusedSlug(undefined);
      setSelectedLocation(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("focus");
      router.replace(`/map?${params.toString()}`, { scroll: false });
    } else {
      setFocusedSlug(loc.slug);
      setSelectedLocation(loc);
      const params = new URLSearchParams(searchParams.toString());
      params.set("focus", loc.slug);
      params.set("layer", layer);
      router.replace(`/map?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, layer, router]);

  const handleSearchSelect = (loc: { id: string; name: string; slug: string } | null) => {
    if (!loc) return;
    const fullLoc = locations.find(l => l.slug === loc.slug);
    if (fullLoc) handlePinClick(fullLoc);
  };

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (initialFocusSlug) {
      const loc = locations.find((l) => l.slug === initialFocusSlug);
      if (loc) {
        setFocusedSlug(initialFocusSlug);
        setSelectedLocation(loc);
      }
    }
  }, [initialFocusSlug, locations]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <header className="absolute top-0 left-0 right-0 h-28 flex items-center px-10 z-[1000]">
        <MapSearchBar currentLayer={layer} onLocationSelect={handleSearchSelect} />
      </header>

      <LeafletMap
        key={layer}
        locations={locations}
        focusSlug={focusedSlug}
        layer={layer}
        isDark={isDark}
        onPinClick={handlePinClick}
      />

      <div className="absolute top-4 right-4 z-1000 flex rounded-xl overflow-hidden shadow-lg border border-foreground/10 bg-surface-card dark:bg-[#1e1e1e]">
        <button
          onClick={() => handleLayerChange("game")}
          aria-label="Switch to Leonida game map"
          className={`px-3 py-2 text-xs font-bold transition-colors ${
            layer === "game" ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">sports_esports</span>
          Leonida
        </button>
        <button
          onClick={() => handleLayerChange("real")}
          aria-label="Switch to Florida real map"
          className={`px-3 py-2 text-xs font-bold transition-colors ${
            layer === "real" ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">public</span>
          Florida
        </button>
      </div>

      <MapBottomPanel
        location={selectedLocation}
        currentLayer={layer}
        onLayerToggle={handleLayerChange}
      />
    </div>
  );
}
