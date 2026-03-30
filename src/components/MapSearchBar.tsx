"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface MapSearchBarProps {
  currentLayer: "game" | "real";
  onLocationSelect?: (location: { id: string; name: string; slug: string } | null) => void;
}

export function MapSearchBar({ currentLayer, onLocationSelect }: MapSearchBarProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"map" | "feed">("map");
  const [locations, setLocations] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setLocations([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("locations")
      .select("id, name, slug")
      .ilike("name", `%${query}%`)
      .limit(8)
      .then(({ data }) => setLocations(data ?? []));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const matchedLocation = locations.find(
      (loc) => loc.name.toLowerCase() === query.trim().toLowerCase()
    );

    if (matchedLocation) {
      if (mode === "map") {
        router.push(`/map?focus=${matchedLocation.slug}&layer=${currentLayer}`);
      } else {
        router.push(`/?location=${matchedLocation.slug}`);
      }
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    setShowDropdown(false);
  };

  const selectLocation = (loc: { id: string; name: string; slug: string }) => {
    if (mode === "map") {
      if (onLocationSelect) {
        onLocationSelect(loc);
      } else {
        router.push(`/map?focus=${loc.slug}&layer=${currentLayer}`);
      }
    } else {
      router.push(`/?location=${loc.slug}`);
    }
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl" ref={formRef}>
      <div className="flex items-center bg-gray-100/80 dark:bg-[#1e1e1e] rounded-full px-4 py-2.5 border border-transparent dark:border-gray-800 focus-within:border-gray-300 dark:focus-within:border-gray-700 transition-colors">
        <span className="material-symbols-outlined text-gray-400 text-[20px] mr-2">search</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search locations in Leonida..."
          className="bg-transparent border-none focus:ring-0 p-0 w-full text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        />
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={() => setMode("map")}
            className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
              mode === "map"
                ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("feed")}
            className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
              mode === "feed"
                ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
          </button>
        </div>
      </div>

      {showDropdown && locations.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
          {locations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => selectLocation(loc)}
              className="w-full px-4 py-3 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}