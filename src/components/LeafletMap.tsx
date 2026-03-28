"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import type { MapLocation } from "@/lib/locations";
import {
  createGtaCRS,
  gameCoordsToLatLng,
  gtaTileUrl,
  GTA_MIN_ZOOM,
  GTA_MAX_ZOOM,
  GTA_MAX_NATIVE_ZOOM,
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

const REAL_DEFAULT_CENTER: [number, number] = [25.76, -80.19];
const REAL_DEFAULT_ZOOM = 11;
const CARTO_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const GTA_TILESET = "yanis,10";
const GTA_DEFAULT_ZOOM = 5;

function pinSize(postCount: number): number {
  if (postCount >= 50) return 12;
  if (postCount >= 20) return 9;
  if (postCount >= 5) return 7;
  return 5;
}

function pinColor(postCount: number): string {
  if (postCount >= 50) return "#ff2442";
  if (postCount >= 20) return "#e61e3a";
  if (postCount >= 5) return "#f97316";
  return "#6b7280";
}

function createPinIcon(postCount: number): L.DivIcon {
  const size = pinSize(postCount);
  const color = pinColor(postCount);

  return L.divIcon({
    html: `
      <div style="position: relative; width: ${size * 2}px; height: ${size * 2}px;">
        <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 700; white-space: nowrap;">${postCount}</div>
        <div style="width: ${size * 2}px; height: ${size * 2}px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;"></div>
      </div>
    `,
    className: "",
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
  });
}

function createFocusedPinIcon(postCount: number): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 48px; height: 48px;">
        <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap;">${postCount}</div>
        <svg width="48" height="48" viewBox="0 0 24 24" style="filter: drop-shadow(0 4px 12px rgba(255,36,66,0.4));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ff2442" stroke="white" stroke-width="1"/>
        </svg>
      </div>
    `,
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
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
        ?? (focusLoc?.rlLat != null && focusLoc?.rlLng != null
          ? [focusLoc.rlLat, focusLoc.rlLng]
          : REAL_DEFAULT_CENTER);
      mapOptions.center = realCenter;
      mapOptions.zoom = focusLoc ? 14 : REAL_DEFAULT_ZOOM;
    }

    const map = L.map(mapRef.current, mapOptions);

    if (isGame) {
      const GtaTileLayer = L.TileLayer.extend({
        getTileUrl(coords: L.Coords) {
          return gtaTileUrl(GTA_TILESET, coords.z, coords.x, coords.y);
        },
      });
      new (GtaTileLayer as any)("", {
        minZoom: GTA_MIN_ZOOM,
        maxZoom: GTA_MAX_ZOOM,
        maxNativeZoom: GTA_MAX_NATIVE_ZOOM,
        tileSize: 256,
        zoomOffset: 0,
        bounds: L.latLngBounds([-16384, -16384], [16384, 16384]),
        noWrap: true,
        attribution: 'GTA VI map tiles — community data via <a href="https://map.gtadb.org">gtadb.org</a>',
      }).addTo(map);
    } else {
      L.tileLayer(isDark ? CARTO_DARK : CARTO_LIGHT, {
        attribution: CARTO_ATTRIBUTION,
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
    }

    if (!mini) {
      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster: any) => {
          const markers = cluster.getAllChildMarkers();
          const totalPosts = markers.reduce((sum: number, m: any) => sum + (m.options.postCount || 0), 0);
          const size = pinSize(totalPosts);
          const color = pinColor(totalPosts);

          return L.divIcon({
            html: `
              <div style="position: relative; width: ${size * 3}px; height: ${size * 3}px;">
                <div style="position: absolute; top: -22px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap;">${totalPosts}</div>
                <div style="width: ${size * 3}px; height: ${size * 3}px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700;">${markers.length}</div>
              </div>
            `,
            className: "",
            iconSize: [size * 3, size * 3],
            iconAnchor: [size * 1.5, size * 1.5],
          });
        },
      });

      for (const loc of locations) {
        if (focusSlug && loc.slug === focusSlug) continue;

        let latlng: [number, number] | null = null;

        if (isGame) {
          if (loc.igX != null && loc.igY != null) latlng = [loc.igY, loc.igX];
        } else {
          if (loc.rlLat != null && loc.rlLng != null) latlng = [loc.rlLat, loc.rlLng];
        }

        if (!latlng) continue;

        const marker = L.marker(latlng, {
          icon: createPinIcon(loc.postCount),
          postCount: loc.postCount,
        } as any);

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

        clusterGroup.addLayer(marker);
      }

      map.addLayer(clusterGroup);

      if (focusLoc) {
        let focusLatLng: [number, number] | null = null;

        if (isGame) {
          if (focusLoc.igX != null && focusLoc.igY != null) {
            focusLatLng = [focusLoc.igY, focusLoc.igX];
          }
        } else {
          if (focusLoc.rlLat != null && focusLoc.rlLng != null) {
            focusLatLng = [focusLoc.rlLat, focusLoc.rlLng];
          }
        }

        if (focusLatLng) {
          const focusMarker = L.marker(focusLatLng, {
            icon: createFocusedPinIcon(focusLoc.postCount),
            zIndexOffset: 1000,
          });

          if (onPinClick) {
            focusMarker.on("click", () => onPinClick(focusLoc));
          }

          focusMarker.addTo(map);
        }
      }

      (window as any).__filterFeed = (slug: string) => {
        router.push(`/?location=${slug}`);
      };
    } else {
      for (const loc of locations) {
        let latlng: [number, number] | null = null;

        if (isGame) {
          if (loc.igX != null && loc.igY != null) latlng = [loc.igY, loc.igX];
        } else {
          if (loc.rlLat != null && loc.rlLng != null) latlng = [loc.rlLat, loc.rlLng];
        }

        if (!latlng) continue;

        L.marker(latlng, {
          icon: createPinIcon(loc.postCount),
        }).addTo(map);
      }
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [layer, locations, focusSlug, mini, center, isDark, onPinClick, router]);

  return (
    <div
      ref={mapRef}
      className={mini ? "w-full h-full rounded-2xl" : "w-full h-full"}
      style={{ minHeight: mini ? 96 : "100vh" }}
    />
  );
}
