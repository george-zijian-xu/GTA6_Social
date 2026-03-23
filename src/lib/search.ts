import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedPost } from "./feed";

export interface SearchUserResult {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number;
}

export interface SearchResults {
  posts: FeedPost[];
  users: SearchUserResult[];
}

export async function search(
  query: string,
  client: SupabaseClient,
  viewerId?: string,
): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) return { posts: [], users: [] };

  // Search posts via full-text
  const { data: postsRaw } = await client
    .from("posts")
    .select(`
      id, author_id, caption, slug, location_id,
      like_count, comment_count, created_at,
      profiles!posts_author_id_fkey ( username, display_name, avatar_url ),
      post_images ( storage_path, alt_text, width, height, display_order )
    `)
    .textSearch("search_vector", trimmed, { type: "websearch" })
    .limit(20);

  const posts: FeedPost[] = (postsRaw ?? []).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = row.profiles as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgs = (row.post_images as any[]) ?? [];
    const first = imgs.sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)[0];
    return {
      id: row.id,
      authorId: row.author_id,
      caption: row.caption,
      slug: row.slug,
      locationId: row.location_id,
      likeCount: row.like_count,
      commentCount: row.comment_count,
      createdAt: row.created_at,
      score: 0,
      username: profile?.username ?? "",
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      imagePath: first?.storage_path ?? null,
      imageAlt: first?.alt_text ?? null,
      imageWidth: first?.width ?? null,
      imageHeight: first?.height ?? null,
      locationName: null,
      locationSlug: null,
      initialLiked: false,
    };
  });

  // Search users
  const { data: usersRaw } = await client
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .or(`username.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`)
    .limit(10);

  const users: SearchUserResult[] = await Promise.all(
    (usersRaw ?? []).map(async (u) => {
      const { count } = await client
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", u.id);
      return {
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        avatarUrl: u.avatar_url,
        followerCount: count ?? 0,
      };
    }),
  );

  return { posts, users };
}
