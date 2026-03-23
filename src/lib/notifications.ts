import type { SupabaseClient } from "@supabase/supabase-js";

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  actorId: string;
  actorUsername: string;
  actorDisplayName: string | null;
  actorAvatarUrl: string | null;
  postId: string | null;
  postSlug: string | null;
  postCaption: string | null;
  commentBody: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function getNotifications(
  userId: string,
  type: "like" | "comment" | "follow",
  client: SupabaseClient,
): Promise<Notification[]> {
  const { data, error } = await client
    .from("notifications")
    .select(`
      id, type, actor_id, post_id, comment_id, read_at, created_at,
      profiles!notifications_actor_id_fkey ( username, display_name, avatar_url ),
      posts ( slug, caption ),
      comments ( body )
    `)
    .eq("target_user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => {
    const actor = row.profiles;
    const post = row.posts;
    const comment = row.comments;
    return {
      id: row.id,
      type: row.type,
      actorId: row.actor_id,
      actorUsername: actor?.username ?? "",
      actorDisplayName: actor?.display_name ?? null,
      actorAvatarUrl: actor?.avatar_url ?? null,
      postId: row.post_id,
      postSlug: post?.slug ?? null,
      postCaption: post?.caption ?? null,
      commentBody: comment?.body ?? null,
      readAt: row.read_at,
      createdAt: row.created_at,
    };
  });
}

export async function markAsRead(
  userId: string,
  client: SupabaseClient,
): Promise<void> {
  await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("target_user_id", userId)
    .is("read_at", null);
}

export async function getUnreadCount(
  userId: string,
  client: SupabaseClient,
): Promise<number> {
  const { count } = await client
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("target_user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}
