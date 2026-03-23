import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  totalLikes: number;
}

export async function getUserProfile(
  username: string,
  client: SupabaseClient,
): Promise<UserProfile | null> {
  const { data: profile, error } = await client
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, website, created_at")
    .eq("username", username)
    .single();

  if (error || !profile) return null;

  // Follower count
  const { count: followerCount } = await client
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id);

  // Following count
  const { count: followingCount } = await client
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id);

  // Total likes across all posts
  const { data: posts } = await client
    .from("posts")
    .select("like_count")
    .eq("author_id", profile.id);
  const totalLikes = posts?.reduce((sum, p) => sum + p.like_count, 0) ?? 0;

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    website: profile.website,
    createdAt: profile.created_at,
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0,
    totalLikes,
  };
}
