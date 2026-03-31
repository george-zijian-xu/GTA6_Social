"use client";

import { useState, useEffect } from "react";
import type { MapLocation } from "@/lib/locations";

interface MapLocationInfoCardProps {
  location: MapLocation;
  currentLayer: "game" | "real";
  onLayerToggle: (layer: "game" | "real") => void;
}

export function MapLocationInfoCard({ location, currentLayer, onLayerToggle }: MapLocationInfoCardProps) {
  const [hotScore, setHotScore] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/location-hot-score?id=${location.id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setHotScore(data.score ?? 0))
      .catch((err) => {
        if (err.name !== 'AbortError') setHotScore(0);
      });
    return () => controller.abort();
  }, [location.id]);

  const displayName = location.name || location.address || "Unknown Location";
  const showAddress = location.name && location.address;
  const hasGameCoords = location.igX !== null && location.igY !== null;
  const hasRealCoords = location.rlLat !== null && location.rlLng !== null;
  const showToggle = hasGameCoords && hasRealCoords;

  const getActivityLabel = (score: number) => {
    if (score > 100) return "HOT";
    if (score > 20) return "ACTIVE";
    if (score > 5) return "QUIET";
    return "QUIET";
  };

  const activity = hotScore !== null ? getActivityLabel(hotScore) : null;

  return (
    <div className="pointer-events-auto bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-2xl border border-white/40 dark:border-white/5 w-[360px] flex-shrink-0">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-2">
          <h2 className="text-3xl font-extrabold tracking-tighter text-gray-900 dark:text-white leading-tight">
            {displayName}
          </h2>
          {showAddress && (
            <p className="text-secondary text-[0.6rem] uppercase tracking-wide font-medium mt-1">
              {location.address}
            </p>
          )}
        </div>
        {showToggle && (
          <div className="flex p-0.5 bg-gray-100 dark:bg-white/10 rounded-full scale-90 origin-right flex-shrink-0">
            <button
              onClick={() => onLayerToggle("game")}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors ${
                currentLayer === "game" ? "bg-primary text-white shadow-sm" : "text-gray-400"
              }`}
            >
              Game
            </button>
            <button
              onClick={() => onLayerToggle("real")}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors ${
                currentLayer === "real" ? "bg-primary text-white shadow-sm" : "text-gray-400"
              }`}
            >
              Real Life
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Live Activity
            </span>
            <span className="text-[10px] font-bold text-primary">
              {activity || "—"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-transform origin-left"
              style={{ transform: hotScore !== null ? `scaleX(${Math.min(1, hotScore / 100)})` : "scaleX(0)" }}
            />
          </div>
        </div>

        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 font-medium min-h-[3rem]">
          {/* Description placeholder - will be populated from DB later */}
        </p>

        <button
          onClick={() => {
            const toast = document.createElement("div");
            toast.textContent = "Coming soon! 🚧";
            toast.className = "fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-[9999]";
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          }}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-red-600 transition-all active:scale-[0.98]"
        >
          Explore More
        </button>
      </div>
    </div>
  );
}
