/**
 * Crawl GTA VI map tiles from map.gtadb.org and upload to Cloudflare R2.
 *
 * Usage:
 *   pnpm tsx scripts/crawl-gta-tiles.ts [--dry-run] [--tileset yanis,10]
 *
 * Required env vars (in .env.local or shell):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 *
 * Optional: R2_PUBLIC_URL (for verification log at end)
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config({ path: ".env.local" });

// ─── Tile definitions ────────────────────────────────────────────────────────

/** Tile range per zoom level: [[minX, minY], [maxX, maxY]] */
export type TileRange = [[number, number], [number, number]];

/**
 * Known tile ranges for yanis,10 base tileset (version 6).
 * Derived from tiles.py output in the gtadb.org open-source repo.
 */
export const YANIS_RANGES: Record<number, TileRange> = {
  0: [[0, 0], [2, 2]],
  1: [[0, 1], [4, 5]],
  2: [[0, 2], [9, 11]],
  3: [[0, 4], [19, 23]],
  4: [[0, 8], [38, 47]],
  5: [[0, 17], [77, 95]],
  6: [[0, 34], [155, 190]],
};

/** Known tile ranges for dupzor,51 — slightly different bounds */
export const DUPZOR_RANGES: Record<number, TileRange> = {
  0: [[0, 0], [1, 1]],
  1: [[0, 0], [3, 3]],
  2: [[0, 1], [6, 7]],
  3: [[0, 2], [12, 14]],
  4: [[1, 5], [24, 29]],
  5: [[2, 10], [49, 59]],
  6: [[4, 21], [98, 118]],
};

export const TILESETS: Record<string, Record<number, TileRange>> = {
  "yanis,10": YANIS_RANGES,
  "dupzor,51": DUPZOR_RANGES,
};

const VERSION = 6;
const SOURCE_BASE = "https://map.gtadb.org/tiles";
const DELAY_MS = 50; // ms between requests
export const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ?? "https://tiles.gta-social.com"; // was previously "https://pub-d0df40b4d0de47d0a484485731f09b6b.r2.dev";

// ─── Pure helpers (unit-testable) ────────────────────────────────────────────

/** Build source URL for a tile on map.gtadb.org */
export function sourceUrl(tileset: string, z: number, y: number, x: number): string {
  return `${SOURCE_BASE}/${VERSION}/${tileset}/${z}/${z},${y},${x}.jpg`;
}

/** Build R2 object key for a tile */
export function r2Key(tileset: string, z: number, y: number, x: number): string {
  return `tiles/${VERSION}/${tileset}/${z}/${z},${y},${x}.jpg`;
}

/** Count total tiles across all zoom levels for a tileset */
export function countTiles(ranges: Record<number, TileRange>): number {
  let total = 0;
  for (const [, [[minX, minY], [maxX, maxY]]] of Object.entries(ranges)) {
    total += (maxX - minX + 1) * (maxY - minY + 1);
  }
  return total;
}

/** Iterate all (z, y, x) tuples for a tileset range */
export function* iterateTiles(
  ranges: Record<number, TileRange>,
): Generator<[number, number, number]> {
  for (const [zStr, [[minX, minY], [maxX, maxY]]] of Object.entries(ranges)) {
    const z = Number(zStr);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        yield [z, y, x];
      }
    }
  }
}

// ─── R2 client ───────────────────────────────────────────────────────────────

function createR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function existsInR2(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToR2(
  client: S3Client,
  bucket: string,
  key: string,
  body: Uint8Array,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

// ─── Fetch with retry ────────────────────────────────────────────────────────

async function fetchTile(url: string): Promise<Uint8Array | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    } catch (err) {
      if (attempt === 2) {
        console.error(`  FAIL ${url}: ${err instanceof Error ? err.message : err}`);
        return null;
      }
      await sleep(1000 * (attempt + 1));
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const tilesetArg = args.find((a) => !a.startsWith("--"));
  const tilesetNames = tilesetArg ? [tilesetArg] : Object.keys(TILESETS);

  const bucket = process.env.R2_BUCKET ?? "leonida-map-tiles";

  let r2: S3Client | null = null;
  if (!dryRun) {
    r2 = createR2Client();
  }

  for (const tileset of tilesetNames) {
    const ranges = TILESETS[tileset];
    if (!ranges) {
      console.error(`Unknown tileset: ${tileset}. Available: ${Object.keys(TILESETS).join(", ")}`);
      process.exit(1);
    }

    const total = countTiles(ranges);
    console.log(`\n── ${tileset} ── ${total} tiles ──${dryRun ? " (DRY RUN)" : ""}`);

    let done = 0;
    let skipped = 0;
    let uploaded = 0;
    let notFound = 0;

    for (const [z, y, x] of iterateTiles(ranges)) {
      done++;
      const key = r2Key(tileset, z, y, x);

      if (r2 && !dryRun) {
        // Check if already exists
        if (await existsInR2(r2, bucket, key)) {
          skipped++;
          if (done % 500 === 0) {
            console.log(`  [${done}/${total}] skipped=${skipped} uploaded=${uploaded} 404s=${notFound}`);
          }
          continue;
        }
      }

      const url = sourceUrl(tileset, z, y, x);

      if (dryRun) {
        if (done <= 5 || done % 1000 === 0) console.log(`  would fetch: ${url} → ${key}`);
        continue;
      }

      const data = await fetchTile(url);
      if (!data) {
        notFound++;
        continue;
      }

      await uploadToR2(r2!, bucket, key, data);
      uploaded++;

      if (done % 100 === 0) {
        console.log(`  [${done}/${total}] skipped=${skipped} uploaded=${uploaded} 404s=${notFound}`);
      }

      await sleep(DELAY_MS);
    }

    console.log(`  DONE: ${uploaded} uploaded, ${skipped} already existed, ${notFound} not found (404)`);
  }

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    console.log(`\nVerify: ${publicUrl}/tiles/6/yanis,10/3/3,12,15.jpg`);
  }

  console.log("\nComplete.");
}

// Only run main() when executed directly (not imported by tests)
const isDirectExecution = process.argv[1]?.includes("crawl-gta-tiles");
if (isDirectExecution) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
