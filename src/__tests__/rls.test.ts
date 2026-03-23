/**
 * RLS enforcement tests — run with authenticated anon-key client.
 * These tests verify that the RLS policies actually protect/allow the right
 * operations. They MUST use the anon key (not service_role), otherwise RLS
 * is bypassed and the tests prove nothing.
 *
 * Covers issues #20 and #22:
 *   - post_images INSERT (issue #20)
 *   - notifications INSERT (issue #22)
 *   - follows SELECT (issue #22)
 *   - likes SELECT (issue #22)
 *   - comment_likes SELECT (issue #22)
 */
import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Anon client (unauthenticated) for public-read checks */
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

/** Returns a new anon-key client signed in as the given user. */
async function signedInClient(email: string): Promise<SupabaseClient> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error } = await client.auth.signInWithPassword({
    email,
    password: "TestPassword123!",
  });
  if (error) throw new Error(`signedInClient failed: ${error.message}`);
  return client;
}

describe("RLS enforcement", () => {
  const ts = Date.now();
  let author: { id: string };
  let other: { id: string };
  let postId: string;
  let commentId: string;
  let authorEmail: string;
  let otherEmail: string;

  beforeAll(async () => {
    authorEmail = `rls-author-${ts}@test.com`;
    otherEmail = `rls-other-${ts}@test.com`;
    author = await createTestUser(authorEmail, `rlsauthor${ts}`);
    other = await createTestUser(otherEmail, `rlsother${ts}`);

    // Seed a post and comment via admin (bypasses RLS — setup only)
    const { data: post } = await admin
      .from("posts")
      .insert({ author_id: author.id, slug: `rls-test-${ts}`, caption: "RLS test post" })
      .select("id")
      .single();
    postId = post!.id;
    cleanup.postIds.push(postId);

    const { data: comment } = await admin
      .from("comments")
      .insert({ post_id: postId, author_id: author.id, body: "RLS test comment" })
      .select("id")
      .single();
    commentId = comment!.id;
  });

  afterAll(async () => {
    await admin.from("notifications").delete().eq("post_id", postId);
    await admin.from("comment_likes").delete().eq("comment_id", commentId);
    await admin.from("likes").delete().eq("post_id", postId);
    await admin.from("follows").delete().eq("follower_id", other.id);
    await admin.from("follows").delete().eq("follower_id", author.id);
    await admin.from("comments").delete().eq("post_id", postId);
    await admin.from("post_images").delete().eq("post_id", postId);
    for (const pid of cleanup.postIds) {
      await admin.from("posts").delete().eq("id", pid);
    }
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  // ── post_images INSERT (issue #20) ──────────────────────────────────────

  test("authenticated user can insert post_images for their own post", async () => {
    const client = await signedInClient(authorEmail);

    const { error } = await client.from("post_images").insert({
      post_id: postId,
      storage_path: "posts/rls-test.jpg",
      display_order: 0,
    });

    expect(error).toBeNull();
  });

  test("authenticated user cannot insert post_images for someone else's post", async () => {
    const client = await signedInClient(otherEmail);

    const { error } = await client.from("post_images").insert({
      post_id: postId,
      storage_path: "posts/rls-intrusion.jpg",
      display_order: 0,
    });

    expect(error).toBeTruthy();
  });

  // ── follows SELECT (issue #22) ──────────────────────────────────────────

  test("unauthenticated client can read follows (public)", async () => {
    // Seed a follow via admin
    await admin
      .from("follows")
      .insert({ follower_id: other.id, following_id: author.id });

    const { data, error } = await anon
      .from("follows")
      .select("*")
      .eq("follower_id", other.id);

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.length).toBeGreaterThanOrEqual(1);
  });

  // ── likes SELECT (issue #22) ────────────────────────────────────────────

  test("unauthenticated client can read likes (public)", async () => {
    // Seed a like via admin
    await admin.from("likes").insert({ user_id: other.id, post_id: postId });

    const { data, error } = await anon
      .from("likes")
      .select("*")
      .eq("post_id", postId);

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.length).toBeGreaterThanOrEqual(1);
  });

  // ── comment_likes SELECT (issue #22) ───────────────────────────────────

  test("unauthenticated client can read comment_likes (public)", async () => {
    // Seed a comment like via admin
    await admin
      .from("comment_likes")
      .insert({ user_id: other.id, comment_id: commentId });

    const { data, error } = await anon
      .from("comment_likes")
      .select("*")
      .eq("comment_id", commentId);

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.length).toBeGreaterThanOrEqual(1);
  });

  // ── notifications INSERT (issue #22) ───────────────────────────────────

  test("authenticated user can insert notification as actor", async () => {
    const client = await signedInClient(otherEmail);

    const { error } = await client.from("notifications").insert({
      type: "like",
      actor_id: other.id,
      target_user_id: author.id,
      post_id: postId,
    });

    expect(error).toBeNull();
  });

  test("authenticated user cannot insert notification pretending to be someone else", async () => {
    const client = await signedInClient(otherEmail);

    const { error } = await client.from("notifications").insert({
      type: "like",
      actor_id: author.id, // lying about who the actor is
      target_user_id: other.id,
      post_id: postId,
    });

    expect(error).toBeTruthy();
  });

  // ── publishing with images end-to-end (issues #20 + #22 combined) ──────

  test("createPost with images succeeds using authenticated anon client", async () => {
    const { createPost } = await import("@/lib/publish");
    const client = await signedInClient(authorEmail);

    const result = await createPost({
      authorId: author.id,
      caption: "RLS end-to-end test post",
      images: [{ storagePath: "posts/rls-e2e.jpg", width: 800, height: 600 }],
      client,
    });

    expect(result).toBeTruthy();
    expect(result!.slug).toContain("rls-end-to-end");
    cleanup.postIds.push(result!.id);
  });
});
