/**
 * Import GTA VI landmark data from locations/landmarks.json into Supabase.
 *
 * Usage:
 *   pnpm tsx scripts/import-locations.ts [--dry-run]
 *
 * Required env vars (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });

// ─── Data shape from gtadb.org landmarks.json ────────────────────────────────
// [ig_address, ig_coordinates, ig_photo_dims, rl_address, rl_coordinates, rl_photo_dims, tags, color, last_edited]

type RawLandmark = [
  string,                   // 0: ig_address
  [number, number] | [],    // 1: ig_coordinates [x, y]
  unknown,                  // 2: ig_photo_dims
  string,                   // 3: rl_address
  [number, number] | [],    // 4: rl_coordinates [lat, lng]
  unknown,                  // 5: rl_photo_dims
  string[],                 // 6: tags
  string,                   // 7: color
  unknown,                  // 8: last_edited
];

// Tags that describe provenance/status, not category
const META_TAGS = new Set(["2022", "unconfirmed", "demolished", "may-not-exist", "reused", "construction"]);

function getCategory(tags: string[]): string | null {
  return tags.find((t) => !META_TAGS.has(t)) ?? null;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function uniqueSlug(base: string, seen: Set<string>): string {
  let slug = base || "landmark";
  let i = 2;
  while (seen.has(slug)) slug = `${base}-${i++}`;
  seen.add(slug);
  return slug;
}

function getName(igAddress: string, rlAddress: string): string {
  if (!igAddress.startsWith("?")) return igAddress;
  // Fall back to the building/place name (first segment of rl_address)
  const building = rlAddress.split(",")[0].trim();
  return building || igAddress;
}

function transform(id: string, raw: RawLandmark, seen: Set<string>) {
  const name = getName(raw[0], raw[3]);
  const igCoords = Array.isArray(raw[1]) && raw[1].length === 2 ? raw[1] : null;
  const rlCoords = Array.isArray(raw[4]) && raw[4].length === 2 ? raw[4] : null;

  return {
    name,
    slug: uniqueSlug(toSlug(name) || id.toLowerCase(), seen),
    category: getCategory(raw[6] ?? []),
    ig_x: igCoords ? igCoords[0] : null,
    ig_y: igCoords ? igCoords[1] : null,
    rl_lat: rlCoords ? rlCoords[0] : null,
    rl_lng: rlCoords ? rlCoords[1] : null,
    address: raw[3] || null,
    description: null,
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const file = join(process.cwd(), "locations", "landmarks.json");
  const raw: Record<string, RawLandmark> = JSON.parse(readFileSync(file, "utf-8"));
  const ids = Object.keys(raw);
  console.log(`Loaded ${ids.length} landmarks from ${file}`);

  const seen = new Set<string>();
  const rows = ids.map((id) => transform(id, raw[id], seen));
  console.log(`Transformed ${rows.length} rows`);

  if (dryRun) {
    console.log("\nFirst 5 rows:");
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
    console.log(`\nWould upsert ${rows.length} rows into locations.`);
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const BATCH = 500;
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("locations")
      .upsert(batch, { onConflict: "slug" });
    if (error) {
      console.error(`Batch ${i}–${i + batch.length - 1} failed:`, error.message);
      process.exit(1);
    }
    done += batch.length;
    console.log(`  Upserted ${done}/${rows.length}`);
  }

  console.log(`\nDone. ${done} locations imported.`);
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
