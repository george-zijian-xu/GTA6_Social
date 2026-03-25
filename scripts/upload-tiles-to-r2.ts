/**
 * Upload local GTA VI map tiles to Cloudflare R2.
 * Reads from locations/gtadb.org-main/map/tiles/6/{tileset}/
 * Uploads to R2 key: tiles/6/{tileset}/{z}/{z},{y},{x}.jpg
 *
 * Usage:
 *   pnpm dlx tsx scripts/upload-tiles-to-r2.ts [--dry-run] [--tileset yanis,10]
 *
 * Required env vars (in .env.local):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 */

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "dotenv";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import https from "https";

config({ path: ".env.local" });

const TILESETS = ["yanis,10", "dupzor,51"];
const VERSION = 6;
const TILES_DIR = join(process.cwd(), "locations", "gtadb.org-main", "map", "tiles");
const CONCURRENCY = 20;
const REQUEST_TIMEOUT_MS = 15_000; // abort any single R2 request after 15s

function createR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY in .env.local");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
    requestHandler: {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    } as never,
  });
}

async function existsInR2(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    const abort = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }), { abortSignal: abort });
    return true;
  } catch {
    return false;
  }
}

/** Walk a directory recursively, yielding file paths */
function* walkFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walkFiles(full);
    else yield full;
  }
}

/** Run tasks with bounded concurrency */
async function pool<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const tilesetArg = args.find((a) => !a.startsWith("--"));
  const tilesets = tilesetArg ? [tilesetArg] : TILESETS;
  const bucket = process.env.R2_BUCKET ?? "leonida-map-tiles";

  const r2 = dryRun ? null : createR2Client();

  for (const tileset of tilesets) {
    const tilesetDir = join(TILES_DIR, String(VERSION), tileset);
    const files = [...walkFiles(tilesetDir)].filter((f) => f.endsWith(".jpg"));
    console.log(`\n── ${tileset} ── ${files.length} tiles ──${dryRun ? " (DRY RUN)" : ""}`);

    if (dryRun) {
      console.log(`  Would upload ${files.length} tiles`);
      console.log(`  Sample: tiles/${VERSION}/${tileset}/0/0,0,0.jpg`);
      continue;
    }

    let uploaded = 0;
    let skipped = 0;
    let failed = 0;
    let done = 0;
    const total = files.length;

    const tasks = files.map((filePath) => async () => {
      // Derive R2 key from local path
      // filePath: .../tiles/6/yanis,10/3/3,12,15.jpg
      // key:      tiles/6/yanis,10/3/3,12,15.jpg
      const rel = filePath.replace(/\\/g, "/").split(`/map/tiles/`)[1];
      const key = `tiles/${rel}`;

      if (await existsInR2(r2!, bucket, key)) {
        skipped++;
      } else {
        try {
          const abort = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
          const body = readFileSync(filePath);
          await r2!.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: "image/jpeg",
            CacheControl: "public, max-age=31536000, immutable",
          }), { abortSignal: abort });
          uploaded++;
        } catch (err) {
          failed++;
          console.error(`  FAIL ${key}: ${err instanceof Error ? err.message : err}`);
        }
      }

      done++;
      if (done % 500 === 0 || done === total) {
        console.log(`  [${done}/${total}] uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
      }
    });

    await pool(tasks, CONCURRENCY);
    console.log(`  DONE: ${uploaded} uploaded, ${skipped} already existed, ${failed} failed`);
  }

  console.log("\nComplete.");
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
