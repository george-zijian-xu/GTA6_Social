"use client";

import { useState } from "react";
import type { MapLocation } from "@/lib/locations";

interface MapLocationInfoCardProps {
  location: MapLocation;
}

function getActivityLabel(hotScore: number): { emoji: string; label: string } {
  if (hotScore > 100) return { emoji: "🔥", label: "Hot" };
  if (hotScore > 20) return { emoji: "⚡", label: "Active" };
  if (hotScore > 5) return { emoji: "📍", label: "Steady" };
  return { emoji: "💤", label: "Quiet" };
}

export function MapLocationInfoCard({ location }: MapLocationInfoCardProps) {
  const [mode, setMode] = useState<"game" | "real">("game");
  const [hotScore] = useState(0); // TODO: fetch from calculateLocationHotScore

  const activity = getActivityLabel(hotScore);
  const hasGameCoords = location.igX !== null && location.igY !== null;
  const hasRealCoords = location.rlLat !== null && location.rlLng !== null;
  const showToggle = hasGameCoords && hasRealCoords;

  const handleExploreMore = () => {
    const toast = document.createElement("div");
    toast.textContent = "Coming soon! 🚧";
    toast.className = "fixed top-4 left-1/2 -translate-x-1/2 bg-surface-card dark:bg-[#1e1e1e] text-foreground px-6 py-3 rounded-full shadow-lg z-[9999] text-sm font-medium border border-foreground/10";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="pointer-events-auto bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-2xl border border-white/40 dark:border-white/5 w-[360px] flex-shrink-0">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-gray-900 dark:text-white">
            {location.name}
          </h2>
          {location.address && (
            <p className="text-secondary text-[0.6rem] uppercase tracking-wide font-medium mt-1">
              {location.address}
            </p>
          )}
        </div>
        {showToggle && (
          <div className="flex p-0.5 bg-gray-100 dark:bg-white/10 rounded-full scale-90 origin-right">
            <button
              onClick={() => setMode("game")}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors ${
                mode === "game" ? "bg-primary text-white shadow-sm" : "text-gray-400"
              }`}
            >
              Game
            </button>
            <button
              onClick={() => setMode("real")}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors ${
                mode === "real" ? "bg-primary text-white shadow-sm" : "text-gray-400"
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
              {activity.emoji} {activity.label.toUpperCase()}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(hotScore, 100)}%` }}
            />
          </div>
        </div>
        {location.description && (
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 font-medium line-clamp-3">
            {location.description.slice(0, 150)}
          </p>
        )}
        <button
          onClick={handleExploreMore}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-red-600 transition-all active:scale-[0.98]"
        >
          EXPLORE MORE
        </button>
      </div>
    </div>
  );
}
