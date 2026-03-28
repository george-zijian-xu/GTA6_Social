"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { searchLocations } from "@/lib/locations";
import type { MapLocation } from "@/lib/locations";

export function MapSearchBar() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"map" | "magnifier">("map");
  const [results, setResults] = useState<MapLocation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const client = createClient();
      const locations = await searchLocations(query, client);
      setResults(locations);
      setShowDropdown(locations.length > 0);
    }, 350);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  function handleSelect(location: MapLocation) {
    const layer = searchParams.get("layer") || "game";
    if (mode === "map") {
      router.push(`/map?focus=${location.slug}&layer=${layer}`);
    } else {
      router.push(`/?location=${location.slug}`);
    }
    setQuery("");
    setShowDropdown(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    if (results.length > 0) {
      handleSelect(results[0]);
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="flex rounded-lg overflow-hidden border border-foreground/10 bg-surface-card dark:bg-[#1e1e1e]">
          <button
            type="button"
            onClick={() => setMode("map")}
            className={`px-2 py-1.5 transition-colors ${
              mode === "map" ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("magnifier")}
            className={`px-2 py-1.5 transition-colors ${
              mode === "magnifier" ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
          </button>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg bg-surface-secondary dark:bg-[#2a2a2a] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-surface-card dark:bg-[#1e1e1e] rounded-lg shadow-lg border border-foreground/10 max-h-64 overflow-y-auto z-50">
          {results.map((location) => (
            <button
              key={location.id}
              onClick={() => handleSelect(location)}
              className="w-full px-4 py-2 text-left hover:bg-surface-secondary dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <div className="text-sm font-medium text-foreground">{location.name}</div>
              {location.category && (
                <div className="text-xs text-foreground-muted">{location.category}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


