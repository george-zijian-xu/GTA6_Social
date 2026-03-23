/**
 * TDD tests for issue #25: like count persistence and viewer_liked in feed.
 *
 * These tests use an authenticated anon-key client (not service_role)
 * to verify that DB triggers fire correctly under RLS and that the feed
 * returns the correct viewer_liked value.
 */
import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cleanup = { userIds: [] as string[], postIds: [] as string[] };

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

async function signedInClient(email: string): Promise<SupabaseClient> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error } = await client.auth.signInWithPassword({
    email,
    password: "TestPassword123!",
  });
  if (error) throw new Error(`signedInClient: ${error.message}`);
  return client;
}

describe("Like count persistence under RLS", () => {
  const ts = Date.now();
  let author: { id: string };
  let liker: { id: string };
  let likerEmail: string;
  let postId: string;

  beforeAll(async () => {
    author = await createTestUser(`lc-author-${ts}@test.com`, `lcauthor${ts}`);
    likerEmail = `lc-liker-${ts}@test.com`;
    liker = await createTestUser(likerEmail, `lcliker${ts}`);

    const { data: post } = await admin
      .from("posts")
      .insert({ author_id: author.id, slug: `lc-test-${ts}`, caption: "Like count test" })
      .select("id")
      .single();
    postId = post!.id;
    cleanup.postIds.push(postId);
  });

  afterAll(async () => {
    await admin.from("notifications").delete().eq("post_id", postId);
    await admin.from("likes").delete().eq("post_id", postId);
    for (const pid of cleanup.postIds)
      await admin.from("posts").delete().eq("id", pid);
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  // Cycle 1: trigger increments count under authenticated user
  test("like_count increments in DB when authenticated anon client likes", async () => {
    const client = await signedInClient(likerEmail);
    const { togglePostLike } = await import("@/lib/likes");

    await togglePostLike(postId, liker.id, true, client);

    const { data } = await admin
      .from("posts")
      .select("like_count")
      .eq("id", postId)
      .single();

    expect(data!.like_count).toBe(1);
  });

  // Cycle 2: trigger decrements count under authenticated user
  test("like_count decrements in DB when authenticated anon client unlikes", async () => {
    const client = await signedInClient(likerEmail);
    const { togglePostLike } = await import("@/lib/likes");

    await togglePostLike(postId, liker.id, false, client);

    const { data } = await admin
      .from("posts")
      .select("like_count")
      .eq("id", postId)
      .single();

    expect(data!.like_count).toBe(0);
  });

  // Cycle 3: count never goes below 0 after like+unlike from 0
  test("like_count stays at 0 after like then unlike on a post with 0 likes", async () => {
    const client = await signedInClient(likerEmail);
    const { togglePostLike } = await import("@/lib/likes");

    // Like then immediately unlike
    await togglePostLike(postId, liker.id, true, client);
    await togglePostLike(postId, liker.id, false, client);

    const { data } = await admin
      .from("posts")
      .select("like_count")
      .eq("id", postId)
      .single();

    expect(data!.like_count).toBe(0);
    expect(data!.like_count).toBeGreaterThanOrEqual(0);
  });
});

describe("Feed viewer_liked field", () => {
  const ts = Date.now() + 1;
  let author: { id: string };
  let viewer: { id: string };
  let viewerEmail: string;
  let postId: string;

  beforeAll(async () => {
    author = await createTestUser(`vl-author-${ts}@test.com`, `vlauthor${ts}`);
    viewerEmail = `vl-viewer-${ts}@test.com`;
    viewer = await createTestUser(viewerEmail, `vlviewer${ts}`);

    const { data: post } = await admin
      .from("posts")
      .insert({ author_id: author.id, slug: `vl-test-${ts}`, caption: "Viewer liked test" })
      .select("id")
      .single();
    postId = post!.id;
    cleanup.postIds.push(postId);
  });

  afterAll(async () => {
    await admin.from("likes").delete().eq("post_id", postId);
  });

  // Cycle 4: feed returns viewer_liked=false before liking
  test("get_feed returns viewer_liked=false for a post the viewer has not liked", async () => {
    const { data } = await admin.rpc("get_feed", {
      p_viewer_id: viewer.id,
    });

    const row = data?.find((r: { id: string }) => r.id === postId);
    expect(row).toBeTruthy();
    expect(row.viewer_liked).toBe(false);
  });

  // Cycle 5: feed returns viewer_liked=true after liking
  test("get_feed returns viewer_liked=true after viewer likes the post", async () => {
    // Like via admin (service_role) to isolate this from trigger fix
    await admin.from("likes").insert({ user_id: viewer.id, post_id: postId });

    const { data } = await admin.rpc("get_feed", {
      p_viewer_id: viewer.id,
    });

    const row = data?.find((r: { id: string }) => r.id === postId);
    expect(row).toBeTruthy();
    expect(row.viewer_liked).toBe(true);
  });
});
