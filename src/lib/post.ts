import type { SupabaseClient } from "@supabase/supabase-js";

// --- Types ---

export interface PostImage {
  id: string;
  storagePath: string;
  altText: string | null;
  displayOrder: number;
  width: number | null;
  height: number | null;
}

export interface PostDetail {
  id: string;
  authorId: string;
  caption: string;
  slug: string;
  locationId: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  locationName: string | null;
  locationSlug: string | null;
  locationIgX: number | null;
  locationIgY: number | null;
  images: PostImage[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  likeCount: number;
  createdAt: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  parentCommentId: string | null;
}

// --- Queries ---

export async function getPostBySlug(
  slug: string,
  client: SupabaseClient,
): Promise<PostDetail | null> {
  const { data: post, error } = await client
    .from("posts")
    .select(`
      id, author_id, caption, slug, location_id,
      like_count, comment_count, created_at,
      profiles!posts_author_id_fkey ( username, display_name, avatar_url ),
      locations ( name, slug, ig_x, ig_y )
    `)
    .eq("slug", slug)
    .single();

  if (error || !post) return null;

  // Fetch images
  const { data: images } = await client
    .from("post_images")
    .select("id, storage_path, alt_text, display_order, width, height")
    .eq("post_id", post.id)
    .order("display_order", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = post.profiles as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const location = post.locations as any;

  return {
    id: post.id,
    authorId: post.author_id,
    caption: post.caption,
    slug: post.slug,
    locationId: post.location_id,
    likeCount: post.like_count,
    commentCount: post.comment_count,
    createdAt: post.created_at,
    username: profile?.username ?? "",
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    locationName: location?.name ?? null,
    locationSlug: location?.slug ?? null,
    locationIgX: location?.ig_x ?? null,
    locationIgY: location?.ig_y ?? null,
    images: (images ?? []).map((img) => ({
      id: img.id,
      storagePath: img.storage_path,
      altText: img.alt_text,
      displayOrder: img.display_order,
      width: img.width,
      height: img.height,
    })),
  };
}

export async function getComments(
  postId: string,
  sort: "recent" | "top",
  client: SupabaseClient,
): Promise<Comment[]> {
  let query = client
    .from("comments")
    .select(`
      id, post_id, author_id, body, like_count, created_at, parent_comment_id,
      profiles!comments_author_id_fkey ( username, display_name, avatar_url )
    `)
    .eq("post_id", postId);

  if (sort === "top") {
    query = query.order("like_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = row.profiles as any;
    return {
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      body: row.body,
      likeCount: row.like_count,
      createdAt: row.created_at,
      username: profile?.username ?? "",
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      parentCommentId: row.parent_comment_id ?? null,
    };
  });
}
