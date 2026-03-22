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
    // Create 5 posts with distinct scores (different like counts, same age)
    const posts = [];
    for (let i = 5; i >= 1; i--) {
      const p = await createTestPost(
        authorA.id,
        `cursor-${i}-${Date.now()}`,
        i * 20, // 100, 80, 60, 40, 20 likes
        0,
        hoursAgo(1),
      );
      posts.push(p);
    }

    // Freeze time for consistent scores across paginated calls
    const refTime = new Date().toISOString();

    // Page 1: limit 2
    const { data: page1, error: e1 } = await admin.rpc("get_feed", {
      p_viewer_id: null,
      p_limit: 2,
      p_ref_time: refTime,
    });
    expect(e1).toBeNull();
    expect(page1!.length).toBeGreaterThanOrEqual(2);

    // Use last row as cursor
    const lastRow = page1![page1!.length - 1];
    const { data: page2, error: e2 } = await admin.rpc("get_feed", {
      p_viewer_id: null,
      p_cursor_score: lastRow.score,
      p_cursor_created_at: lastRow.created_at,
      p_cursor_id: lastRow.id,
      p_limit: 2,
      p_ref_time: refTime,
    });
    expect(e2).toBeNull();
    expect(page2!.length).toBeGreaterThanOrEqual(1);

    // No overlap
    const page1Ids = new Set(page1!.map((r: { id: string }) => r.id));
    const page2Ids = page2!.map((r: { id: string }) => r.id);
    for (const id of page2Ids) {
      expect(page1Ids.has(id)).toBe(false);
    }

    // Page 2 scores are lower or equal to page 1's last score
    for (const row of page2!) {
      expect(Number(row.score)).toBeLessThanOrEqual(Number(lastRow.score));
    }
  });
});
