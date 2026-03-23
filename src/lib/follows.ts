import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Toggle follow. Returns false if self-follow attempted.
 */
export async function toggleFollow(
  followerId: string,
  followingId: string,
  follow: boolean,
  client: SupabaseClient,
): Promise<boolean> {
  if (followerId === followingId) return false;

  if (follow) {
    const { error } = await client
      .from("follows")
      .upsert(
        { follower_id: followerId, following_id: followingId },
        { onConflict: "follower_id,following_id" },
      );
    if (error) throw error;

    // Create notification
    await client.from("notifications").insert({
      type: "follow",
      actor_id: followerId,
      target_user_id: followingId,
    });
  } else {
    const { error } = await client
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
    if (error) throw error;
  }

  return true;
}

export async function getFollowerCount(
  userId: string,
  client: SupabaseClient,
): Promise<number> {
  const { count } = await client
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);
  return count ?? 0;
}

export async function getFollowingCount(
  userId: string,
  client: SupabaseClient,
): Promise<number> {
  const { count } = await client
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);
  return count ?? 0;
}

export async function isFollowing(
  followerId: string,
  followingId: string,
  client: SupabaseClient,
): Promise<boolean> {
  const { data } = await client
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
}
