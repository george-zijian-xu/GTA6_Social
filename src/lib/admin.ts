import type { SupabaseClient } from "@supabase/supabase-js";

export async function submitReport({
  reporterId,
  postId,
  commentId,
  reason,
  client,
}: {
  reporterId: string;
  postId?: string;
  commentId?: string;
  reason: string;
  client: SupabaseClient;
}): Promise<boolean> {
  const { error } = await client.from("reports").insert({
    reporter_id: reporterId,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
    reason,
    status: "pending",
  });
  return !error;
}

export async function isAdmin(userId: string, client: SupabaseClient): Promise<boolean> {
  const { data } = await client
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return data?.is_admin === true;
}
