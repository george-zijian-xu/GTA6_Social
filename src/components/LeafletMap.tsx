"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapLocation } from "@/lib/locations";
import {
  createGtaCRS,
  gameCoordsToLatLng,
  gtaTileUrl,
  GTA_MIN_ZOOM,
  GTA_MAX_ZOOM,
  GTA_DEFAULT_CENTER,
} from "@/lib/gta-crs";

interface LeafletMapProps {
  locations: MapLocation[];
  focusSlug?: string;
  mini?: boolean;
  center?: [number, number];
  layer?: "game" | "real";
  isDark?: boolean;
  onPinClick?: (location: MapLocation) => void;
}

// Real-world defaults (Florida / Vice City area)
const REAL_DEFAULT_CENTER: [number, number] = [25.76, -80.19];
const REAL_DEFAULT_ZOOM = 11;
const CARTO_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// GTA tile config
const GTA_TILESET = "yanis,10";
const GTA_DEFAULT_ZOOM = 5; // Leaflet zoom 5 = gtadb zoom 3, good overview

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

export function LeafletMap({
  locations,
  focusSlug,
  mini = false,
  center,
  layer = "real",
  isDark = false,
  onPinClick,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const isGame = layer === "game";
    const focusLoc = focusSlug ? locations.find((l) => l.slug === focusSlug) : null;

    // ── CRS + center ──
    let mapOptions: L.MapOptions = { zoomControl: !mini, attributionControl: !mini };

    if (isGame) {
      const GtaCRS = createGtaCRS(L);
      mapOptions.crs = GtaCRS;
      mapOptions.minZoom = GTA_MIN_ZOOM;
      mapOptions.maxZoom = GTA_MAX_ZOOM;

      const focusLL =
        focusLoc?.igX != null && focusLoc?.igY != null
          ? gameCoordsToLatLng(focusLoc.igX, focusLoc.igY)
          : GTA_DEFAULT_CENTER;
      mapOptions.center = [focusLL.lat, focusLL.lng];
      mapOptions.zoom = focusLoc ? GTA_MAX_ZOOM - 2 : GTA_DEFAULT_ZOOM;
    } else {
      const realCenter: [number, number] = center
        ?? (focusLoc?.igX != null && focusLoc?.igY != null
          ? [focusLoc.igY, focusLoc.igX]
          : REAL_DEFAULT_CENTER);
      mapOptions.center = realCenter;
      mapOptions.zoom = focusLoc ? 14 : REAL_DEFAULT_ZOOM;
    }

    const map = L.map(mapRef.current, mapOptions);

    // ── Tile layer ──
    if (isGame) {
      L.tileLayer("", {
        minZoom: GTA_MIN_ZOOM,
        maxZoom: GTA_MAX_ZOOM,
        tileSize: 256,
        attribution:
          'GTA VI map tiles — <a href="https://map.gtadb.org">gtadb.org</a>',
        // Custom getTileUrl via class extension
      } as L.TileLayerOptions);

      // Use a custom TileLayer that builds the gtadb URL
      const GtaTileLayer = L.TileLayer.extend({
        getTileUrl(coords: L.Coords) {
          return gtaTileUrl(GTA_TILESET, coords.z, coords.x, coords.y);
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (GtaTileLayer as any)("", {
        minZoom: GTA_MIN_ZOOM,
        maxZoom: GTA_MAX_ZOOM,
        attribution: 'GTA VI map tiles — <a href="https://map.gtadb.org">gtadb.org community</a>',
      }).addTo(map);
    } else {
      L.tileLayer(isDark ? CARTO_DARK : CARTO_LIGHT, {
        attribution: CARTO_ATTRIBUTION,
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
    }

    // ── Pins ──
    let maxPostCount = 0;
    let maxMarker: L.CircleMarker | null = null;

    for (const loc of locations) {
      let latlng: [number, number] | null = null;

      if (isGame) {
        if (loc.igX != null && loc.igY != null) latlng = [loc.igY, loc.igX];
      } else {
        if (loc.rlLat != null && loc.rlLng != null) latlng = [loc.rlLat, loc.rlLng];
      }

      if (!latlng) continue;

      const size = pinSize(loc.postCount);
      const color = pinColor(loc.postCount);

      const marker = L.circleMarker(latlng, {
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
        if (onPinClick) {
          marker.on("click", () => onPinClick(loc));
        } else {
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
      setTimeout(() => map.removeLayer(ping), 3000);
    }

    mapInstanceRef.current = map;

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
