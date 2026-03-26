/**
 * GTA VI in-game coordinate system for Leaflet.
 *
 * The gtadb.org tile system uses a custom coordinate space:
 *   - World: 32768×32768 px at the reference zoom (gtadb z=5)
 *   - zeroX = zeroY = 16384 (pixel position of game origin in the tile grid)
 *   - Zoom levels 0–6 (gtadb), mapped to Leaflet zoom 2–8 (offset +2)
 *   - Tile size: 256×256 px
 *   - Tile path: {version}/{tileset}/{z_g}/{z_g},{y},{x}.jpg
 *
 * Leaflet CRS transformation: L.Transformation(1/128, 128, -1/128, 128)
 *   px = (igX / 128 + 128) * scale   → pixel 0 at igX = -16384
 *   py = (-igY / 128 + 128) * scale  → pixel 0 at igY = +16384 (north)
 */

// ─── Constants ───────────────────────────────────────────────────────────────

/** Leaflet zoom = gtadb zoom + this offset */
export const GTA_ZOOM_OFFSET = 2;

/** Leaflet min zoom (gtadb z=0) */
export const GTA_MIN_ZOOM = 2;

/** Leaflet max zoom (gtadb z=6) */
export const GTA_MAX_ZOOM = 8;

/** Actual max zoom with available tiles (gtadb z=6 = Leaflet z=8) */
export const GTA_MAX_NATIVE_ZOOM = 8;

/** Default game-world center (roughly central Leonida) */
export const GTA_DEFAULT_CENTER = { lat: 0, lng: -2000 } as const;

/** Transformation coefficients for L.Transformation(a, b, c, d) */
export const GTA_TRANSFORM = { a: 1 / 128, b: 128, c: -1 / 128, d: 128 } as const;

const GTA_TILE_BASE_URL = process.env.NEXT_PUBLIC_R2_TILES_URL ?? "";

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Build a tile URL for the GTA VI tile layer.
 * Converts Leaflet zoom to gtadb zoom (subtract GTA_ZOOM_OFFSET).
 */
export function gtaTileUrl(
  tileset: string,
  leafletZ: number,
  tileX: number,
  tileY: number,
): string {
  const gtaZ = leafletZ - GTA_ZOOM_OFFSET;
  return `${GTA_TILE_BASE_URL}/tiles/6/${tileset}/${gtaZ}/${gtaZ},${tileY},${tileX}.jpg`;
}

/**
 * Convert in-game coordinates to a Leaflet LatLng-compatible object.
 * Convention: lat = igY (north-south), lng = igX (east-west).
 */
export function gameCoordsToLatLng(igX: number, igY: number): { lat: number; lng: number } {
  return { lat: igY, lng: igX };
}

/**
 * Compute which Leaflet tile (tileX, tileY) a game coordinate falls on
 * at a given Leaflet zoom level. Useful for verifying the CRS math.
 */
export function gameToTile(
  igX: number,
  igY: number,
  leafletZ: number,
): { tx: number; ty: number } {
  const scale = Math.pow(2, leafletZ);
  const px = (GTA_TRANSFORM.a * igX + GTA_TRANSFORM.b) * scale;
  const py = (GTA_TRANSFORM.c * igY + GTA_TRANSFORM.d) * scale;
  return { tx: Math.floor(px / 256), ty: Math.floor(py / 256) };
}

// ─── Leaflet CRS factory (browser-only, not SSR) ─────────────────────────────

/**
 * Create the custom Leaflet CRS for the GTA VI in-game map.
 * Must be called in a browser context (Leaflet requires window).
 */
export function createGtaCRS(L: typeof import("leaflet")) {
  return L.Util.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(
      GTA_TRANSFORM.a,
      GTA_TRANSFORM.b,
      GTA_TRANSFORM.c,
      GTA_TRANSFORM.d,
    ),
    infinite: false,
  });
}
