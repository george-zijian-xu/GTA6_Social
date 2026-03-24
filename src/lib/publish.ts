import type { SupabaseClient } from "@supabase/supabase-js";
import { containsProfanity } from "./profanity";

// --- Slug generation ---

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

// --- Post creation ---

interface CreatePostParams {
  authorId: string;
  title?: string;
  caption: string;
  locationId?: string;
  images: { storagePath: string; altText?: string; width?: number; height?: number }[];
  client: SupabaseClient;
}

interface CreatePostResult {
  id: string;
  slug: string;
}

export async function createPost({
  authorId,
  title,
  caption,
  locationId,
  images,
  client,
}: CreatePostParams): Promise<CreatePostResult | null> {
  // Profanity check on both title and caption
  if (containsProfanity(caption) || (title && containsProfanity(title))) {
    return null;
  }

  // Slug based on title if available, otherwise caption
  const slugSource = title?.trim() || caption;
  const baseSlug = slugify(slugSource) || "post";
  let slug = `${baseSlug}-${randomSuffix()}`;

  // Check for collision (very unlikely but handle it)
  const { data: existing } = await client
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${baseSlug}-${randomSuffix()}`;
  }

  // Insert post
  const { data: post, error: postErr } = await client
    .from("posts")
    .insert({
      author_id: authorId,
      title: title?.trim() || null,
      caption,
      slug,
      location_id: locationId ?? null,
    })
    .select("id, slug")
    .single();

  if (postErr) throw postErr;

  // Insert images
  if (images.length > 0) {
    const imageRows = images.map((img, i) => ({
      post_id: post.id,
      storage_path: img.storagePath,
      alt_text: img.altText ?? null,
      display_order: i,
      width: img.width ?? null,
      height: img.height ?? null,
    }));

    const { error: imgErr } = await client.from("post_images").insert(imageRows);
    if (imgErr) throw imgErr;
  }

  return { id: post.id, slug: post.slug };
}
