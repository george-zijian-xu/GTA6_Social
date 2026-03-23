import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cleanup = {
  userIds: [] as string[],
  postIds: [] as string[],
  commentIds: [] as string[],
};

async function createTestUser(email: string, username: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "TestPassword123!",
    email_confirm: true,
    user_metadata: { username },
  });
  if (error) throw error;
  cleanup.userIds.push(data.user.id);
  return data.user;
}

describe("Post Detail", () => {
  const ts = Date.now();
  const TEST_SLUG = `test-post-${ts}`;
  let author: { id: string };
  let commenter: { id: string };
  let postId: string;

  beforeAll(async () => {
    author = await createTestUser(`pd-author-${ts}@test.com`, `pdauthor${ts}`);
    commenter = await createTestUser(`pd-commenter-${ts}@test.com`, `pdcommenter${ts}`);

    // Create post
    const { data: post, error: postErr } = await admin
      .from("posts")
      .insert({
        author_id: author.id,
        slug: TEST_SLUG,
        caption: "Test post caption for detail page",
        like_count: 42,
        comment_count: 3,
      })
      .select("id")
      .single();
    if (postErr) throw postErr;
    postId = post.id;
    cleanup.postIds.push(postId);

    // Create 2 images
    await admin.from("post_images").insert([
      { post_id: postId, storage_path: "posts/img1.jpg", alt_text: "First image", display_order: 0, width: 800, height: 600 },
      { post_id: postId, storage_path: "posts/img2.jpg", alt_text: "Second image", display_order: 1, width: 800, height: 600 },
    ]);

    // Create 3 comments with different timestamps and like_counts
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const twoHoursAgo = new Date(Date.now() - 7200_000).toISOString();
    const threeHoursAgo = new Date(Date.now() - 10800_000).toISOString();

    const { data: comments } = await admin
      .from("comments")
      .insert([
        { post_id: postId, author_id: commenter.id, body: "Oldest, most liked", like_count: 10, created_at: threeHoursAgo },
        { post_id: postId, author_id: commenter.id, body: "Middle age, least liked", like_count: 1, created_at: twoHoursAgo },
        { post_id: postId, author_id: commenter.id, body: "Newest, mid likes", like_count: 5, created_at: oneHourAgo },
      ])
      .select("id");
    if (comments) cleanup.commentIds.push(...comments.map((c) => c.id));
  });

  afterAll(async () => {
    for (const cid of cleanup.commentIds) {
      await admin.from("comments").delete().eq("id", cid);
    }
    for (const pid of cleanup.postIds) {
      await admin.from("post_images").delete().eq("post_id", pid);
      await admin.from("posts").delete().eq("id", pid);
    }
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  test("fetches post detail by slug with images and author", async () => {
    // Import dynamically so the test file can be written before the module exists
    const { getPostBySlug } = await import("@/lib/post");

    const post = await getPostBySlug(TEST_SLUG, admin);
    expect(post).toBeTruthy();
    expect(post!.slug).toBe(TEST_SLUG);
    expect(post!.caption).toBe("Test post caption for detail page");
    expect(post!.username).toBeTruthy();
    expect(post!.likeCount).toBe(42);
    expect(post!.images).toHaveLength(2);
    expect(post!.images[0].displayOrder).toBe(0);
    expect(post!.images[1].displayOrder).toBe(1);
  });

  test("returns comments sorted by Recent and Top", async () => {
    const { getComments } = await import("@/lib/post");

    // Recent: newest first (created_at DESC)
    const recent = await getComments(postId, "recent", admin);
    expect(recent).toHaveLength(3);
    expect(recent[0].body).toBe("Newest, mid likes");
    expect(recent[2].body).toBe("Oldest, most liked");

    // Top: most liked first (like_count DESC)
    const top = await getComments(postId, "top", admin);
    expect(top).toHaveLength(3);
    expect(top[0].body).toBe("Oldest, most liked");
    expect(top[0].likeCount).toBe(10);
    expect(top[2].body).toBe("Middle age, least liked");
    expect(top[2].likeCount).toBe(1);
  });

  test("returns null for non-existent slug", async () => {
    const { getPostBySlug } = await import("@/lib/post");

    const post = await getPostBySlug("does-not-exist-xyz-999", admin);
    expect(post).toBeNull();
  });
});
