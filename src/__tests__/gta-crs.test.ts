import { describe, test, expect } from "vitest";
import {
  gtaTileUrl,
  gameCoordsToLatLng,
  gameToTile,
  GTA_ZOOM_OFFSET,
  GTA_MIN_ZOOM,
  GTA_MAX_ZOOM,
} from "@/lib/gta-crs";

describe("gta-crs — pure helpers", () => {
  describe("gtaTileUrl", () => {
    test("subtracts zoom offset to get gtadb zoom", () => {
      // Leaflet zoom 4 → gtadb zoom 2
      const url = gtaTileUrl("yanis,10", 4, 15, 12);
      expect(url).toContain("/tiles/6/yanis,10/2/2,12,15.jpg");
    });

    test("uses {gtaZ},{y},{x} filename format, not {z}/{x}/{y}", () => {
      const url = gtaTileUrl("yanis,10", 2, 5, 3);
      // leafletZ=2 → gtaZ=0
      expect(url).toContain("0/0,3,5.jpg");
      expect(url).not.toContain("0/5/3");
    });

    test("uses NEXT_PUBLIC_R2_TILES_URL as base when set", () => {
      // URL should start with the tile base domain and contain the correct path
      const url = gtaTileUrl("yanis,10", 8, 80, 100);
      expect(url).toMatch(/^https?:\/\//);
      // gtaZ = 8 - 2 = 6, format: {gtaZ},{y},{x}
      expect(url).toContain("/6/yanis,10/6/6,100,80.jpg");
    });
  });

  describe("gameCoordsToLatLng", () => {
    test("returns lat=igY, lng=igX", () => {
      const latlng = gameCoordsToLatLng(1899, 1721);
      expect(latlng.lat).toBe(1721);
      expect(latlng.lng).toBe(1899);
    });

    test("handles negative coordinates", () => {
      const latlng = gameCoordsToLatLng(-8000, 4000);
      expect(latlng.lat).toBe(4000);
      expect(latlng.lng).toBe(-8000);
    });
  });

  describe("gameToTile", () => {
    test("game origin (0,0) lands in the expected tile at leaflet zoom 4", () => {
      // At z_l=4 (z_g=2), scale=16
      // px = (0/128 + 128) * 16 = 2048 → tileX = 2048/256 = 8
      // py = (-0/128 + 128) * 16 = 2048 → tileY = 2048/256 = 8
      const { tx, ty } = gameToTile(0, 0, 4);
      expect(tx).toBe(8);
      expect(ty).toBe(8);
    });

    test("northwest corner (-16384, 16384) maps to tile (0, 0)", () => {
      const { tx, ty } = gameToTile(-16384, 16384, 4);
      expect(tx).toBe(0);
      expect(ty).toBe(0);
    });

    test("tile index increases as igX increases", () => {
      const a = gameToTile(-16000, 0, 4);
      const b = gameToTile(0, 0, 4);
      const c = gameToTile(4000, 0, 4);
      expect(a.tx).toBeLessThan(b.tx);
      expect(b.tx).toBeLessThan(c.tx);
    });
  });

  describe("zoom constants", () => {
    test("zoom offset is 2", () => {
      expect(GTA_ZOOM_OFFSET).toBe(2);
    });

    test("min leaflet zoom maps to gtadb z=0", () => {
      expect(GTA_MIN_ZOOM - GTA_ZOOM_OFFSET).toBe(0);
    });

    test("max leaflet zoom maps to gtadb z=6", () => {
      expect(GTA_MAX_ZOOM - GTA_ZOOM_OFFSET).toBe(6);
    });
  });
});
