import { createClient } from "@/lib/supabase/server";
import { mapFeedRow, type FeedCursor, type FeedPage } from "./feed";

const PAGE_SIZE = 20;

export async function fetchFeedPage(
  cursor?: FeedCursor,
): Promise<FeedPage> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
