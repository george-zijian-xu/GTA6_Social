"use client";

import { useEffect, useRef, useState } from "react";
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
const POPULAR_THRESHOLD = 50;
const TOP_LOCATIONS_COUNT = 100;

function createPinHTML(loc: MapLocation, isFocused: boolean): string {
  if (loc.postCount === 0) {
    return `<div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;cursor:pointer">
      <div style="width:6px;height:6px;background:${isFocused ? '#ff2442' : '#9ca3af'};border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2)"></div>
    </div>`;
  }

  const isPopular = loc.hotScore >= POPULAR_THRESHOLD;
  const bg = isFocused ? '#ff2442' : '#ffffff';
  const color = isFocused ? '#ffffff' : '#374151';
  const border = isFocused ? 'none' : (isPopular ? '2px solid rgba(255,36,66,0.25)' : '1px solid #e5e7eb');

  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
    <div style="background:${bg};color:${color};font-size:9px;font-weight:700;padding:4px 6px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:${border};font-family:Inter,sans-serif">
      ${loc.postCount} <span style="font-size:7px;font-weight:500;opacity:0.7">posts</span>
    </div>
    <div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid ${bg};margin-top:-1px"></div>
  </div>`;
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
  const markersRef = useRef<L.Marker[]>([]);
  const router = useRouter();
  const [currentZoom, setCurrentZoom] = useState<number>(0);

  // Initialize map once
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
      mapOptions.zoom = focusLoc ? 7 : GTA_DEFAULT_ZOOM;
    } else {
      const realCenter: [number, number] = center
        ?? (focusLoc?.rlLat != null && focusLoc?.rlLng != null
          ? [focusLoc.rlLat, focusLoc.rlLng]
          : REAL_DEFAULT_CENTER);
      mapOptions.center = realCenter;
      mapOptions.zoom = focusLoc ? 14 : REAL_DEFAULT_ZOOM;
    }

    const map = L.map(mapRef.current, mapOptions);
    setCurrentZoom(map.getZoom());

    if (isGame) {
      const GtaTileLayer = L.TileLayer.extend({
        getTileUrl(coords: L.Coords) {
          return gtaTileUrl(GTA_TILESET, coords.z, coords.x, coords.y);
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    map.on('zoomend', () => setCurrentZoom(map.getZoom()));

    if (!mini && onPinClick) {
      map.on('click', (e) => {
        if (e.originalEvent.target === map.getContainer()) {
          onPinClick(null as unknown as MapLocation);
        }
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [layer, mini, center, onPinClick, router]);

  // Render pins whenever locations, focusSlug, or zoom changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const isGame = layer === "game";
    const zoomThreshold = isGame ? 6 : 13;
    const showAll = currentZoom >= zoomThreshold;

    let visibleLocs = locations;
    if (!showAll) {
      const sorted = [...locations].sort((a, b) =>
        b.hotScore !== a.hotScore ? b.hotScore - a.hotScore : b.postCount - a.postCount
      );
      const top = sorted.slice(0, TOP_LOCATIONS_COUNT);
      if (focusSlug && !top.find(l => l.slug === focusSlug)) {
        const focused = locations.find(l => l.slug === focusSlug);
        if (focused) top.push(focused);
      }
      visibleLocs = top;
    }

    for (const loc of visibleLocs) {
      let latlng: [number, number] | null = null;
      if (isGame) {
        if (loc.igX != null && loc.igY != null) latlng = [loc.igY, loc.igX];
      } else {
        if (loc.rlLat != null && loc.rlLng != null) latlng = [loc.rlLat, loc.rlLng];
      }
      if (!latlng) continue;

      const isFocused = loc.slug === focusSlug;
      const icon = L.divIcon({
        html: createPinHTML(loc, isFocused),
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker(latlng, { icon }).addTo(map);
      markersRef.current.push(marker);

      if (!mini && onPinClick) {
        marker.on("click", () => {
          onPinClick(loc);
          map.flyTo(latlng, isGame ? 7 : 14, { duration: 0.5 });
        });
      }
    }
  }, [locations, focusSlug, currentZoom, layer, mini, onPinClick]);

  return (
    <div
      ref={mapRef}
      className={mini ? "w-full h-full rounded-2xl" : "w-full h-full"}
      style={{ minHeight: mini ? 96 : "100vh" }}
    />
  );
}
