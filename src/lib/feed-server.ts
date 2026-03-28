import { createClient } from "@/lib/supabase/server";
import { mapFeedRow, type FeedCursor, type FeedPage } from "./feed";

const PAGE_SIZE = 20;

export async function fetchFeedPage(
  cursor?: FeedCursor,
  locationSlug?: string,
): Promise<FeedPage> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (locationSlug) {
    const refTime = cursor?.refTime ?? new Date().toISOString();

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, author_id, caption, slug, post_type, location_id,
        like_count, comment_count, created_at, hot_score,
        profiles!posts_author_id_fkey ( username, display_name, avatar_url ),
        post_images ( storage_path, alt_text, width, height, display_order ),
        locations!inner ( slug, name )
      `)
      .eq("locations.slug", locationSlug)
      .order("hot_score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) throw error;

    const posts = (data ?? []).map((row) => {
      const profile = row.profiles as any;
      const imgs = (row.post_images as any[]) ?? [];
      const first = imgs.sort((a, b) => a.display_order - b.display_order)[0];
      const loc = row.locations as any;
      return {
        id: row.id,
        authorId: row.author_id,
        title: null,
        caption: row.caption,
        slug: row.slug,
        postType: (row.post_type ?? "RR") as any,
        locationId: row.location_id,
        likeCount: row.like_count,
        commentCount: row.comment_count,
        createdAt: row.created_at,
        score: row.hot_score ?? 0,
        username: profile?.username ?? "",
        displayName: profile?.display_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        imagePath: first?.storage_path ?? null,
        imageAlt: first?.alt_text ?? null,
        imageWidth: first?.width ?? null,
        imageHeight: first?.height ?? null,
        locationName: loc?.name ?? null,
        locationSlug: loc?.slug ?? null,
        initialLiked: false,
      };
    });

    return { posts, nextCursor: null };
  }

  const refTime = cursor?.refTime ?? new Date().toISOString();

  const { data, error } = await supabase.rpc("get_feed", {
    p_viewer_id: user?.id ?? null,
    p_cursor_score: cursor?.score ?? null,
    p_cursor_created_at: cursor?.createdAt ?? null,
    p_cursor_id: cursor?.id ?? null,
    p_limit: PAGE_SIZE,
    p_ref_time: refTime,
  });

  if (error) throw error;

  const posts = (data ?? []).map(mapFeedRow);
  const nextCursor: FeedCursor | null =
    posts.length === PAGE_SIZE
      ? {
          score: posts[posts.length - 1].score,
          createdAt: posts[posts.length - 1].createdAt,
          id: posts[posts.length - 1].id,
          refTime,
        }
      : null;

  return { posts, nextCursor };
}
