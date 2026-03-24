import { createClient } from "@/lib/supabase/client";
import type { PostType } from "@/lib/post";

// --- Types ---

export interface FeedPost {
  id: string;
  authorId: string;
  title: string | null;
  caption: string;
  slug: string;
  postType: PostType;
  locationId: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  score: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  imagePath: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  locationName: string | null;
  locationSlug: string | null;
  initialLiked: boolean;
}

export interface FeedCursor {
  score: number;
  createdAt: string;
  id: string;
  refTime: string;
}

export interface FeedPage {
  posts: FeedPost[];
  nextCursor: FeedCursor | null;
}

// --- Row mapper ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFeedRow(row: any): FeedPost {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title ?? null,
    caption: row.caption,
    slug: row.slug,
    postType: (row.post_type ?? "RR") as PostType,
    locationId: row.location_id,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    score: Number(row.score),
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    imagePath: row.image_path,
    imageAlt: row.image_alt,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    locationName: row.location_name,
    locationSlug: row.location_slug,
    initialLiked: row.viewer_liked ?? false,
  };
}

const PAGE_SIZE = 20;

function buildFeedPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  refTime: string,
): FeedPage {
  const posts = data.map(mapFeedRow);
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

// --- Client-side fetch (for infinite scroll) ---

export async function fetchFeedPageClient(
  cursor: FeedCursor,
): Promise<FeedPage> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_feed", {
    p_viewer_id: user?.id ?? null,
    p_cursor_score: cursor.score,
    p_cursor_created_at: cursor.createdAt,
    p_cursor_id: cursor.id,
    p_limit: PAGE_SIZE,
    p_ref_time: cursor.refTime,
  });

  if (error) throw error;
  return buildFeedPage(data ?? [], cursor.refTime);
}
