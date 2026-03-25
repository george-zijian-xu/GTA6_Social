/**
 * Seed sample posts with locations for testing.
 * Usage: pnpm dlx tsx scripts/seed-sample-posts.ts [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { randomUUID } from "crypto";

config({ path: ".env.local" });

const POSTS: Array<{
  caption: string;
  title: string;
  post_type: string;
  location_slug: string;
}> = [
  {
    title: "Spotted a flamingo at the beach!",
    caption: "Just chilling on Vice Beach when this absolute unit walked past me. Only in Leonida 🦩 #wildlife #vicecity",
    post_type: "RR",
    location_slug: "boardwalk-vice-beach",
  },
  {
    title: "The views from Ritz are unreal",
    caption: "Checked into the Ritz for the weekend. If you know, you know. The ocean view suite hits different at golden hour.",
    post_type: "GG",
    location_slug: "the-ritz-carlton-bal-harbour",
  },
  {
    title: "Car meet at the marina tonight",
    caption: "Pulled up in the Infernus and immediately got ten people asking for a ride. No I will not be taking questions.",
    post_type: "GG",
    location_slug: "port-of-miami-parking-garage-g",
  },
  {
    title: "Vice City nightlife is something else",
    caption: "Started at Ocean Drive, ended up at some rooftop I still can't find on maps. 10/10 would lose my wallet again.",
    post_type: "RR",
    location_slug: "ocean-view-hotel-vice-beach",
  },
  {
    title: "Working the late shift again",
    caption: "Dispatch says 'quiet night' and then immediately sends me to Vice Beach at 2am. Story of my life. At least the sunrise is free.",
    post_type: "GR",
    location_slug: "dominion-hotel-vice-beach",
  },
  {
    title: "This city never sleeps and neither do I",
    caption: "Third espresso. The pelicans outside are judging me. I can feel it.",
    post_type: "RR",
    location_slug: "hotel-dixon-vice-beach",
  },
  {
    title: "Almost got run over by a jet ski on dry land",
    caption: "Sir this is a parking lot. Anyway Vice City is thriving. Living my best life out here.",
    post_type: "GG",
    location_slug: "seashell-hotel-vice-beach",
  },
  {
    title: "New spot just dropped",
    caption: "Found this place by accident while evading — I mean, while taking a scenic drive. The ceviche is incredible. Zero stars on Google Maps somehow.",
    post_type: "RG",
    location_slug: "bayfront-heights-vice-beach",
  },
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const sb = createClient(supabaseUrl, serviceKey);

  // Get first profile to author the posts
  const { data: profiles, error: profileErr } = await sb
    .from("profiles")
    .select("id, username")
    .limit(1);

  if (profileErr || !profiles?.length) {
    throw new Error(`No profiles found: ${profileErr?.message ?? "empty table"}. Create an account first.`);
  }

  const author = profiles[0];
  console.log(`Authoring posts as: ${author.username} (${author.id})`);

  // Resolve location slugs to IDs
  const slugs = POSTS.map((p) => p.location_slug);
  const { data: locations, error: locErr } = await sb
    .from("locations")
    .select("id, slug, name")
    .in("slug", slugs);

  if (locErr) throw new Error(`Location lookup failed: ${locErr.message}`);

  const slugToLoc = Object.fromEntries((locations ?? []).map((l) => [l.slug, l]));

  // Warn about any missing slugs
  for (const slug of slugs) {
    if (!slugToLoc[slug]) console.warn(`  WARNING: location slug not found: "${slug}" — post will have no location`);
  }

  // Build post rows
  const rows = POSTS.map((p) => ({
    id: randomUUID(),
    author_id: author.id,
    title: p.title,
    caption: p.caption,
    post_type: p.post_type,
    slug: `sample-${randomUUID().slice(0, 8)}`,
    location_id: slugToLoc[p.location_slug]?.id ?? null,
  }));

  if (dryRun) {
    console.log("\nDry run — rows to insert:");
    rows.forEach((r) => {
      const loc = slugToLoc[POSTS.find((p) => r.title === p.title)?.location_slug ?? ""];
      console.log(`  [${r.post_type}] "${r.title}" → ${loc?.name ?? "no location"}`);
    });
    return;
  }

  const { error: insertErr } = await sb.from("posts").insert(rows);
  if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);

  console.log(`\nInserted ${rows.length} sample posts.`);
  rows.forEach((r) => {
    const p = POSTS.find((p) => r.title === p.title)!;
    const loc = slugToLoc[p.location_slug];
    console.log(`  [${r.post_type}] "${r.title}" → ${loc?.name ?? "no location"}`);
  });
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
