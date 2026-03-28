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
