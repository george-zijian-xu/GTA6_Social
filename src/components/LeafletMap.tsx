"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import type L from "leaflet";
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
const TOP_LOCATIONS_COUNT = 50;

function createPinHTML(loc: MapLocation, isFocused: boolean): string {
  if (loc.postCount === 0 && !isFocused) {
    return `<div style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer">
      <div style="width:8px;height:8px;background:#9ca3af;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2)"></div>
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
  const leafletRef = useRef<typeof L | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const prevFocusRef = useRef<string | undefined>(undefined);
  const prevFlyToRef = useRef<string | undefined>(undefined);
  const onPinClickRef = useRef(onPinClick);
  const router = useRouter();
  const [currentZoom, setCurrentZoom] = useState<number>(0);

  // Keep onPinClick ref current without triggering marker rebuilds
  useEffect(() => { onPinClickRef.current = onPinClick; }, [onPinClick]);

  // Swap CARTO tile layer when dark mode changes (real map only)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    const oldTile = tileLayerRef.current;
    if (!map || !L || !oldTile || layer === "game") return;

    map.removeLayer(oldTile);
    const newTile = L.tileLayer(isDark ? CARTO_DARK : CARTO_LIGHT, {
      attribution: CARTO_ATTRIBUTION,
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    tileLayerRef.current = newTile;
  }, [isDark, layer]);

  // Initialize map once — loads Leaflet JS dynamically to avoid SSR window access
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;
      leafletRef.current = L;

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
        const tile = L.tileLayer(isDark ? CARTO_DARK : CARTO_LIGHT, {
          attribution: CARTO_ATTRIBUTION,
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);
        tileLayerRef.current = tile;
      }

      map.on('zoomend', () => setCurrentZoom(map.getZoom()));

      if (!mini) {
        map.on('click', (e) => {
          if (e.originalEvent.target === map.getContainer()) {
            onPinClickRef.current?.(null as unknown as MapLocation);
          }
        });
      }

      mapInstanceRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current.clear();
      leafletRef.current = null;
      tileLayerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, mini, center, router]);

  // Memoize sorted top locations (avoids re-sorting on every zoom change)
  const sortedTopLocations = useMemo(() => {
    if (mini) return locations;
    return [...locations]
      .sort((a, b) =>
        b.hotScore !== a.hotScore ? b.hotScore - a.hotScore : b.postCount - a.postCount
      )
      .slice(0, TOP_LOCATIONS_COUNT);
  }, [locations, mini]);

  // Memoize the visible slug set (only changes when zoom crosses threshold or locations change)
  const visibleSlugs = useMemo(() => {
    const isGame = layer === "game";
    const zoomThreshold = isGame ? 6 : 13;
    const showAll = currentZoom >= zoomThreshold;

    const visible = (showAll || mini) ? locations : sortedTopLocations;
    const slugSet = new Set(visible.map(l => l.slug));

    // Always include focused location
    if (focusSlug && !slugSet.has(focusSlug)) {
      const focused = locations.find(l => l.slug === focusSlug);
      if (focused) slugSet.add(focused.slug);
    }
    return slugSet;
  }, [locations, sortedTopLocations, currentZoom, layer, mini, focusSlug]);

  // Build a lookup map for locations by slug
  const locationsBySlug = useMemo(() => {
    const map = new Map<string, MapLocation>();
    for (const loc of locations) map.set(loc.slug, loc);
    return map;
  }, [locations]);

  // Differential marker sync — only add/remove/update what changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L || locations.length === 0) return;
    const markerMap = markersRef.current;
    const isGame = layer === "game";

    // Remove markers no longer visible
    for (const [slug, marker] of markerMap) {
      if (!visibleSlugs.has(slug)) {
        map.removeLayer(marker);
        markerMap.delete(slug);
      }
    }

    // Determine which slugs need icon updates (focus changed)
    const prevFocus = prevFocusRef.current;
    const focusChanged = prevFocus !== focusSlug;
    const slugsNeedingIconUpdate = new Set<string>();
    if (focusChanged) {
      if (prevFocus) slugsNeedingIconUpdate.add(prevFocus);
      if (focusSlug) slugsNeedingIconUpdate.add(focusSlug);
    }

    // Add new markers or update icons for existing ones that need it
    for (const slug of visibleSlugs) {
      const loc = locationsBySlug.get(slug);
      if (!loc) continue;

      let latlng: [number, number] | null = null;
      if (isGame) {
        if (loc.igX != null && loc.igY != null) latlng = [loc.igY, loc.igX];
      } else {
        if (loc.rlLat != null && loc.rlLng != null) latlng = [loc.rlLat, loc.rlLng];
      }
      if (!latlng) continue;

      const isFocused = loc.slug === focusSlug;
      const existing = markerMap.get(slug);

      if (existing) {
        // Only update icon if focus state changed for this marker
        if (slugsNeedingIconUpdate.has(slug)) {
          existing.setIcon(L.divIcon({
            html: createPinHTML(loc, isFocused),
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          }));
        }
      } else {
        // Create new marker
        const icon = L.divIcon({
          html: createPinHTML(loc, isFocused),
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker(latlng, { icon }).addTo(map);
        markerMap.set(slug, marker);

        if (!mini) {
          marker.on("click", () => {
            onPinClickRef.current?.(loc);
          });
        }
      }
    }

    prevFocusRef.current = focusSlug;
  }, [visibleSlugs, focusSlug, locations, locationsBySlug, layer, mini]);

  // Fly to focused location when focusSlug changes (handles both pin clicks and search selection)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusSlug || mini) return;

    // Skip the initial mount — the map is already centered via init options
    if (prevFlyToRef.current === undefined) {
      prevFlyToRef.current = focusSlug;
      return;
    }
    // Skip if focus hasn't actually changed
    if (prevFlyToRef.current === focusSlug) return;
    prevFlyToRef.current = focusSlug;

    const loc = locationsBySlug.get(focusSlug);
    if (!loc) return;

    const isGame = layer === "game";
    let latlng: [number, number] | null = null;
    if (isGame) {
      if (loc.igX != null && loc.igY != null) latlng = [loc.igY, loc.igX];
    } else {
      if (loc.rlLat != null && loc.rlLng != null) latlng = [loc.rlLat, loc.rlLng];
    }
    if (latlng) map.flyTo(latlng, isGame ? 7 : 14, { duration: 0.5 });
  }, [focusSlug, locationsBySlug, layer, mini]);

  return (
    <div
      ref={mapRef}
      className={mini ? "w-full h-full rounded-2xl" : "w-full h-full"}
      style={{ minHeight: mini ? 96 : "100vh" }}
    />
  );
}
