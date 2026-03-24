import type { SupabaseClient } from "@supabase/supabase-js";

export interface MapPost {
  id: string;
  slug: string;
  caption: string;
  imagePath: string | null;
  likeCount: number;
}

export interface GetMapPostsResult {
  posts?: MapPost[];
  error?: string;
}

export async function getMapPosts(
  locationSlug: string | undefined,
  client: SupabaseClient,
  limit = 12,
): Promise<GetMapPostsResult> {
  if (!locationSlug) return { error: "location param required" };

  const { data, error } = await client
    .from("posts")
    .select(`
      id, slug, caption, like_count,
      locations!inner ( slug ),
      post_images ( storage_path, display_order )
    `)
    .eq("locations.slug", locationSlug)
    .order("hot_score", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };

  const posts: MapPost[] = (data ?? []).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgs = ((row.post_images as any[]) ?? [])
      .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order);
    return {
      id: row.id,
      slug: row.slug,
      caption: row.caption,
      imagePath: imgs[0]?.storage_path ?? null,
      likeCount: row.like_count,
    };
  });

  return { posts };
}
