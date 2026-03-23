import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Track IDs for cleanup
const cleanup = {
  userIds: [] as string[],
  postIds: [] as string[],
};

// Helpers
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

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

async function createTestPost(
  authorId: string,
  slug: string,
  likeCount: number,
  commentCount: number,
  createdAt: string,
) {
  const { data, error } = await admin
    .from("posts")
    .insert({
      author_id: authorId,
      slug,
      caption: `Test post ${slug}`,
      like_count: likeCount,
      comment_count: commentCount,
      created_at: createdAt,
    })
    .select("id")
    .single();
  if (error) throw error;
  cleanup.postIds.push(data.id);
  return data;
}

describe("Feed", () => {
  let viewerUser: { id: string };
  let authorA: { id: string }; // unfollowed
  let authorB: { id: string }; // followed by viewer

  beforeAll(async () => {
    // Clean up orphan posts from previous failed runs
    const { data: orphans } = await admin
      .from("posts")
      .select("id")
      .like("slug", "cursor-%");
    if (orphans) {
      for (const o of orphans) {
        await admin.from("posts").delete().eq("id", o.id);
      }
    }

    const ts = Date.now();
    viewerUser = await createTestUser(`viewer-${ts}@test.com`, `viewer${ts}`);
    authorA = await createTestUser(`authora-${ts}@test.com`, `authora${ts}`);
    authorB = await createTestUser(`authorb-${ts}@test.com`, `authorb${ts}`);

    // Viewer follows author B
    await admin.from("follows").insert({
      follower_id: viewerUser.id,
      following_id: authorB.id,
    });
  });

  afterAll(async () => {
    // Delete in reverse dependency order
    await admin.from("follows").delete().eq("follower_id", viewerUser.id);
    for (const postId of cleanup.postIds) {
      await admin.from("post_images").delete().eq("post_id", postId);
      await admin.from("posts").delete().eq("id", postId);
    }
    for (const userId of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
    }
  });

  test("returns posts in hot_score descending order", async () => {
    // Post 1: 2h ago, 100 likes → score = 100 / (2+2)^1.5 = 12.5
    // Post 2: 1h ago, 10 likes  → score = 10 / (1+2)^1.5  ≈ 1.92
    // Post 3: 1h ago, 50 likes  → score = 50 / (1+2)^1.5  ≈ 9.62
    // Expected order: Post1 > Post3 > Post2
    const p1 = await createTestPost(authorA.id, `rank-high-${Date.now()}`, 100, 0, hoursAgo(2));
    const p3 = await createTestPost(authorA.id, `rank-mid-${Date.now()}`, 50, 0, hoursAgo(1));
    const p2 = await createTestPost(authorA.id, `rank-low-${Date.now()}`, 10, 0, hoursAgo(1));

    const { data, error } = await admin.rpc("get_feed", {
      p_viewer_id: null,
      p_limit: 10,
    });

    expect(error).toBeNull();
    expect(data).toBeTruthy();

    const ids = data!.map((r: { id: string }) => r.id);
    const i1 = ids.indexOf(p1.id);
    const i3 = ids.indexOf(p3.id);
    const i2 = ids.indexOf(p2.id);

    expect(i1).toBeLessThan(i3); // Post1 before Post3
    expect(i3).toBeLessThan(i2); // Post3 before Post2
  });

  test("applies 1.3x follow boost for followed authors", async () => {
    // Post A (unfollowed author, 2h ago, 50 likes):
    //   score = 50 / (2+2)^1.5 = 6.25
    // Post B (followed author, 2h ago, 40 likes):
    //   base = 40 / (2+2)^1.5 = 5.0
    //   boosted = 5.0 × 1.3 = 6.5 > 6.25 ✓
    const postA = await createTestPost(authorA.id, `boost-a-${Date.now()}`, 50, 0, hoursAgo(2));
    const postB = await createTestPost(authorB.id, `boost-b-${Date.now()}`, 40, 0, hoursAgo(2));

    // Without follow boost (anonymous)
    const { data: anon } = await admin.rpc("get_feed", {
      p_viewer_id: null,
      p_limit: 50,
    });
    const anonIds = anon!.map((r: { id: string }) => r.id);
    expect(anonIds.indexOf(postA.id)).toBeLessThan(anonIds.indexOf(postB.id));

    // With follow boost (viewer follows authorB)
    const { data: boosted } = await admin.rpc("get_feed", {
      p_viewer_id: viewerUser.id,
      p_limit: 50,
    });
    const boostedIds = boosted!.map((r: { id: string }) => r.id);
    expect(boostedIds.indexOf(postB.id)).toBeLessThan(boostedIds.indexOf(postA.id));
  });

  test("cursor pagination returns next page without overlap", async () => {
    // Create 4 posts with very high like counts so they rank above everything else
    const cursorPosts = [];
    for (let i = 4; i >= 1; i--) {
      const p = await createTestPost(
        authorA.id,
        `cursor-${i}-${Date.now()}`,
        i * 1000, // 4000, 3000, 2000, 1000 likes — way above other test posts
        0,
        hoursAgo(1),
      );
      cursorPosts.push(p);
    }

    const refTime = new Date().toISOString();

    // Page 1: get top 2
    const { data: page1, error: e1 } = await admin.rpc("get_feed", {
      p_viewer_id: null,
      p_limit: 2,
      p_ref_time: refTime,
    });
    expect(e1).toBeNull();
    expect(page1).toHaveLength(2);

    // These should be our top 2 cursor posts (4000 and 3000 likes)
    expect(page1![0].id).toBe(cursorPosts[0].id);
    expect(page1![1].id).toBe(cursorPosts[1].id);

    // Page 2 using cursor from last row of page 1
    const lastRow = page1![1];
    const { data: page2, error: e2 } = await admin.rpc("get_feed", {
      p_viewer_id: null,
      p_cursor_score: lastRow.score,
      p_cursor_created_at: lastRow.created_at,
      p_cursor_id: lastRow.id,
      p_limit: 2,
      p_ref_time: refTime,
    });
    expect(e2).toBeNull();
    expect(page2!.length).toBeGreaterThanOrEqual(2);

    // No overlap between page 1 and page 2
    const page1Ids = new Set(page1!.map((r: { id: string }) => r.id));
    for (const row of page2!) {
      expect(page1Ids.has(row.id)).toBe(false);
    }

    // Page 2 first item should be our 3rd cursor post (2000 likes)
    expect(page2![0].id).toBe(cursorPosts[2].id);
  });
});
