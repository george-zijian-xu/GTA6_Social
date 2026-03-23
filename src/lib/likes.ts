import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Toggle a post like. Handles idempotency (double-like is a no-op).
 * Creates a notification for the post author on like (skipped for self-like).
 */
export async function togglePostLike(
  postId: string,
  userId: string,
  like: boolean,
  client: SupabaseClient,
): Promise<void> {
  if (like) {
    // Upsert — idempotent, won't double-insert
    const { error } = await client
      .from("likes")
      .upsert({ user_id: userId, post_id: postId }, { onConflict: "user_id,post_id" });
    if (error) throw error;

    // Create notification if not self-like
    const { data: post } = await client
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single();

    if (post && post.author_id !== userId) {
      await client.from("notifications").insert({
        type: "like",
        actor_id: userId,
        target_user_id: post.author_id,
        post_id: postId,
      });
    }
  } else {
    const { error } = await client
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error) throw error;
  }
}

/**
 * Toggle a comment like. Handles idempotency.
 * Creates a notification for the comment author on like (skipped for self-like).
 */
export async function toggleCommentLike(
  commentId: string,
  userId: string,
  like: boolean,
  client: SupabaseClient,
): Promise<void> {
  if (like) {
    const { error } = await client
      .from("comment_likes")
      .upsert({ user_id: userId, comment_id: commentId }, { onConflict: "user_id,comment_id" });
    if (error) throw error;

    // Notification for comment author
    const { data: comment } = await client
      .from("comments")
      .select("author_id, post_id")
      .eq("id", commentId)
      .single();

    if (comment && comment.author_id !== userId) {
      await client.from("notifications").insert({
        type: "like",
        actor_id: userId,
        target_user_id: comment.author_id,
        comment_id: commentId,
        post_id: comment.post_id,
      });
    }
  } else {
    const { error } = await client
      .from("comment_likes")
      .delete()
      .eq("user_id", userId)
      .eq("comment_id", commentId);
    if (error) throw error;
  }
}

/**
 * Check if the current user has liked a post.
 */
export async function hasUserLikedPost(
  postId: string,
  userId: string,
  client: SupabaseClient,
): Promise<boolean> {
  const { data } = await client
    .from("likes")
    .select("user_id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();
  return !!data;
}
