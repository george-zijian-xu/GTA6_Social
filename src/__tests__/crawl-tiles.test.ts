import { describe, test, expect } from "vitest";
import {
  sourceUrl,
  r2Key,
  countTiles,
  iterateTiles,
  YANIS_RANGES,
  DUPZOR_RANGES,
} from "../../scripts/crawl-gta-tiles";

describe("crawl-gta-tiles — pure helpers", () => {
  test("sourceUrl builds correct gtadb.org URL", () => {
    expect(sourceUrl("yanis,10", 3, 12, 15)).toBe(
      "https://map.gtadb.org/tiles/6/yanis,10/3/3,12,15.jpg",
    );
    expect(sourceUrl("dupzor,51", 0, 0, 0)).toBe(
      "https://map.gtadb.org/tiles/6/dupzor,51/0/0,0,0.jpg",
    );
  });

  test("r2Key builds correct R2 object path", () => {
    expect(r2Key("yanis,10", 3, 12, 15)).toBe(
      "tiles/6/yanis,10/3/3,12,15.jpg",
    );
  });

  test("countTiles computes total across all zoom levels", () => {
    // Z=0 for yanis: x 0-2, y 0-2 → 3×3 = 9
    // Z=1: x 0-4, y 1-5 → 5×5 = 25
    // ... sum all up
    const total = countTiles(YANIS_RANGES);
    expect(total).toBeGreaterThan(30000); // ~32k tiles
    expect(total).toBeLessThan(40000);

    // Dupzor is smaller
    const dupzorTotal = countTiles(DUPZOR_RANGES);
    expect(dupzorTotal).toBeGreaterThan(5000);
    expect(dupzorTotal).toBeLessThan(15000);
  });

  test("iterateTiles yields correct (z, y, x) tuples for zoom 0", () => {
    const z0Tiles = [...iterateTiles({ 0: YANIS_RANGES[0] })];
    // x 0-2, y 0-2 → 9 tiles
    expect(z0Tiles).toHaveLength(9);
    expect(z0Tiles[0]).toEqual([0, 0, 0]);
    expect(z0Tiles[z0Tiles.length - 1]).toEqual([0, 2, 2]);
  });

  test("iterateTiles preserves zoom ordering", () => {
    const tiles = [...iterateTiles(YANIS_RANGES)];
    const total = countTiles(YANIS_RANGES);
    expect(tiles).toHaveLength(total);

    // First tile should be z=0
    expect(tiles[0][0]).toBe(0);
    // Last tile should be z=6
    expect(tiles[tiles.length - 1][0]).toBe(6);
  });
});
