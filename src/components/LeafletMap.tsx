"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapLocation } from "@/lib/locations";

interface LeafletMapProps {
  locations: MapLocation[];
  focusSlug?: string;
  mini?: boolean;
  center?: [number, number];
}

// Default center for Leonida (roughly Florida/Vice City area)
const DEFAULT_CENTER: [number, number] = [25.76, -80.19];
const DEFAULT_ZOOM = 11;

// Community tile attribution
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | GTA 6 Map tiles coming soon — <a href="https://map.stateofleonida.net">stateofleonida.net</a> / <a href="https://map.gtadb.org">gtadb.org</a>';

function pinSize(postCount: number): number {
  if (postCount >= 50) return 24;
  if (postCount >= 20) return 18;
  if (postCount >= 5) return 14;
  return 10;
}

function pinColor(postCount: number): string {
  if (postCount >= 50) return "#ff2442";
  if (postCount >= 20) return "#e61e3a";
  if (postCount >= 5) return "#f97316";
  return "#6b7280";
}

export function LeafletMap({ locations, focusSlug, mini = false, center }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Find focus location
    const focusLoc = focusSlug
      ? locations.find((l) => l.slug === focusSlug)
      : null;

    const mapCenter = center
      ? center
      : focusLoc?.igX && focusLoc?.igY
        ? [focusLoc.igY, focusLoc.igX] as [number, number]
        : DEFAULT_CENTER;

    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: focusLoc ? 14 : DEFAULT_ZOOM,
      zoomControl: !mini,
      attributionControl: !mini,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 18,
    }).addTo(map);

    // Add location pins
    let maxPostCount = 0;
    let maxMarker: L.CircleMarker | null = null;

    for (const loc of locations) {
      if (!loc.igX || !loc.igY) continue;

      const size = pinSize(loc.postCount);
      const color = pinColor(loc.postCount);

      const marker = L.circleMarker([loc.igY, loc.igX], {
        radius: size / 2,
        fillColor: color,
        fillOpacity: 0.8,
        color: "#fff",
        weight: 2,
      }).addTo(map);

      if (loc.postCount > maxPostCount) {
        maxPostCount = loc.postCount;
        maxMarker = marker;
      }

      if (!mini) {
        marker.bindPopup(`
          <div style="min-width: 180px; font-family: Inter, sans-serif;">
            <h3 style="font-weight: 700; font-size: 14px; margin: 0 0 4px;">${loc.name}</h3>
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">${loc.postCount} posts</p>
            <button
              onclick="window.__filterFeed('${loc.slug}')"
              style="width: 100%; padding: 6px 12px; background: #ff2442; color: white; border: none; border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer;"
            >
              Filter Home Feed
            </button>
          </div>
        `);
      }
    }

    // Animated ping on highest-activity pin
    if (maxMarker && !mini) {
      const latlng = maxMarker.getLatLng();
      const ping = L.circleMarker(latlng, {
        radius: 20,
        fillColor: "#ff2442",
        fillOpacity: 0.3,
        color: "#ff2442",
        weight: 1,
        className: "animate-ping",
      }).addTo(map);
      // Remove after animation
      setTimeout(() => map.removeLayer(ping), 3000);
    }

    mapInstanceRef.current = map;

    // Global handler for popup button
    if (!mini) {
      (window as unknown as Record<string, unknown>).__filterFeed = (slug: string) => {
        router.push(`/?location=${slug}`);
      };
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className={mini ? "w-full h-full rounded-2xl" : "w-full h-full"}
      style={{ minHeight: mini ? 96 : "100vh" }}
    />
  );
}
