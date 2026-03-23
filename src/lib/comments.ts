import type { SupabaseClient } from "@supabase/supabase-js";
export { containsProfanity } from "./profanity";
import { containsProfanity } from "./profanity";

// --- Comment actions ---

interface AddCommentParams {
  postId: string;
  authorId: string;
  body: string;
  parentCommentId?: string;
  client: SupabaseClient;
}

interface CommentResult {
  id: string;
  body: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
}

export async function addComment({
  postId,
  authorId,
  body,
  parentCommentId,
  client,
}: AddCommentParams): Promise<CommentResult | null> {
  // Profanity check
  if (containsProfanity(body)) {
    return null;
  }

  const { data, error } = await client
    .from("comments")
    .insert({
      post_id: postId,
      author_id: authorId,
      body,
      parent_comment_id: parentCommentId ?? null,
    })
    .select("id, body, post_id, author_id, parent_comment_id")
    .single();

  if (error) throw error;

  // Create notification for post author (not self-comment)
  const { data: post } = await client
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (post && post.author_id !== authorId) {
    await client.from("notifications").insert({
      type: "comment",
      actor_id: authorId,
      target_user_id: post.author_id,
      post_id: postId,
      comment_id: data.id,
    });
  }

  return {
    id: data.id,
    body: data.body,
    postId: data.post_id,
    authorId: data.author_id,
    parentCommentId: data.parent_comment_id,
  };
}

export async function deleteComment(
  commentId: string,
  client: SupabaseClient,
): Promise<void> {
  const { error } = await client.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}
