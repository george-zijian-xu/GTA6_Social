import type { SupabaseClient } from "@supabase/supabase-js";

export interface MapLocation {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  igX: number | null;
  igY: number | null;
  rlLat: number | null;
  rlLng: number | null;
  description: string | null;
  postCount: number;
}

export async function getLocationsWithPosts(
  client: SupabaseClient,
): Promise<MapLocation[]> {
  const { data, error } = await client
    .from("locations")
    .select("id, name, slug, category, ig_x, ig_y, rl_lat, rl_lng, description, post_count")
    .gt("post_count", 0)
    .order("post_count", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    igX: row.ig_x,
    igY: row.ig_y,
    rlLat: row.rl_lat ?? null,
    rlLng: row.rl_lng ?? null,
    description: row.description ?? null,
    postCount: row.post_count,
  }));
}

export async function getAllLocations(
  client: SupabaseClient,
): Promise<MapLocation[]> {
  const { data, error } = await client
    .from("locations")
    .select("id, name, slug, category, ig_x, ig_y, rl_lat, rl_lng, description, post_count")
    .order("name");

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    igX: row.ig_x,
    igY: row.ig_y,
    rlLat: row.rl_lat ?? null,
    rlLng: row.rl_lng ?? null,
    description: row.description ?? null,
    postCount: row.post_count,
  }));
}

export async function getLocationBySlug(
  slug: string,
  client: SupabaseClient,
): Promise<MapLocation | null> {
  const { data, error } = await client
    .from("locations")
    .select("id, name, slug, category, ig_x, ig_y, rl_lat, rl_lng, description, post_count")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    category: data.category,
    igX: data.ig_x,
    igY: data.ig_y,
    rlLat: data.rl_lat ?? null,
    rlLng: data.rl_lng ?? null,
    description: data.description ?? null,
    postCount: data.post_count,
  };
}

export async function searchLocations(
  query: string,
  client: SupabaseClient,
): Promise<MapLocation[]> {
  const { data, error } = await client
    .from("locations")
    .select("id, name, slug, category, ig_x, ig_y, rl_lat, rl_lng, description, post_count")
    .ilike("name", `%${query}%`)
    .order("post_count", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    igX: row.ig_x,
    igY: row.ig_y,
    rlLat: row.rl_lat ?? null,
    rlLng: row.rl_lng ?? null,
    description: row.description ?? null,
    postCount: row.post_count,
  }));
}

export async function calculateLocationHotScore(
  locationId: string,
  client: SupabaseClient,
): Promise<number> {
  const { data, error } = await client
    .from("posts")
    .select("like_count, comment_count, created_at")
    .eq("location_id", locationId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return 0;

  const post = data[0];
  const ageHours = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const ups = post.like_count + post.comment_count * 2;

  return ups / Math.pow(ageHours + 2, 1.5);
}

