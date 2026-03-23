import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const cleanup = {
  userIds: [] as string[],
  postIds: [] as string[],
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

describe("Like Toggle", () => {
  const ts = Date.now();
  let postAuthor: { id: string };
  let liker: { id: string };
  let postId: string;

  beforeAll(async () => {
    postAuthor = await createTestUser(`like-author-${ts}@test.com`, `likeauthor${ts}`);
    liker = await createTestUser(`like-liker-${ts}@test.com`, `likeliker${ts}`);

    const { data: post } = await admin
      .from("posts")
      .insert({
        author_id: postAuthor.id,
        slug: `like-test-${ts}`,
        caption: "Like test post",
        like_count: 0,
      })
      .select("id")
      .single();
    postId = post!.id;
    cleanup.postIds.push(postId);
  });

  afterAll(async () => {
    await admin.from("notifications").delete().eq("post_id", postId);
    await admin.from("likes").delete().eq("post_id", postId);
    for (const pid of cleanup.postIds) {
      await admin.from("posts").delete().eq("id", pid);
    }
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  test("like count increments on insert, decrements on delete", async () => {
    const { togglePostLike } = await import("@/lib/likes");

    // Like
    await togglePostLike(postId, liker.id, true, admin);
    const { data: afterLike } = await admin
      .from("posts")
      .select("like_count")
      .eq("id", postId)
      .single();
    expect(afterLike!.like_count).toBe(1);

    // Unlike
    await togglePostLike(postId, liker.id, false, admin);
    const { data: afterUnlike } = await admin
      .from("posts")
      .select("like_count")
      .eq("id", postId)
      .single();
    expect(afterUnlike!.like_count).toBe(0);
  });

  test("double-liking is idempotent", async () => {
    const { togglePostLike } = await import("@/lib/likes");

    await togglePostLike(postId, liker.id, true, admin);
    await togglePostLike(postId, liker.id, true, admin);

    const { data } = await admin
      .from("posts")
      .select("like_count")
      .eq("id", postId)
      .single();
    expect(data!.like_count).toBe(1);

    // Cleanup
    await togglePostLike(postId, liker.id, false, admin);
  });

  test("unauthenticated insert into likes is rejected by RLS", async () => {
    const { error } = await anon.from("likes").insert({
      user_id: liker.id,
      post_id: postId,
    });
    expect(error).toBeTruthy();
  });

  test("notification created on like, skipped on self-like", async () => {
    const { togglePostLike } = await import("@/lib/likes");

    // Clean up any notifications from previous tests
    await admin.from("notifications").delete().eq("post_id", postId);

    // Like by someone else → notification created
    await togglePostLike(postId, liker.id, true, admin);
    const { data: notifs } = await admin
      .from("notifications")
      .select("*")
      .eq("post_id", postId)
      .eq("type", "like")
      .eq("actor_id", liker.id);
    expect(notifs).toHaveLength(1);
    expect(notifs![0].target_user_id).toBe(postAuthor.id);

    // Cleanup the like
    await togglePostLike(postId, liker.id, false, admin);
    await admin.from("notifications").delete().eq("post_id", postId).eq("actor_id", liker.id);

    // Self-like → no notification
    await togglePostLike(postId, postAuthor.id, true, admin);
    const { data: selfNotifs } = await admin
      .from("notifications")
      .select("*")
      .eq("post_id", postId)
      .eq("actor_id", postAuthor.id)
      .eq("type", "like");
    expect(selfNotifs).toHaveLength(0);

    // Cleanup
    await togglePostLike(postId, postAuthor.id, false, admin);
  });
});
