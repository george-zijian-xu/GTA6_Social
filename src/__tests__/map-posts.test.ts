import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const cleanup = { userIds: [] as string[], postIds: [] as string[], locationIds: [] as string[] };

async function createTestUser(email: string, username: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email, password: "TestPassword123!", email_confirm: true,
    user_metadata: { username },
  });
  if (error) throw error;
  cleanup.userIds.push(data.user.id);
  return data.user;
}

describe("GET /api/map-posts", () => {
  const ts = Date.now();
  let author: { id: string };
  let locationId: string;
  const locationSlug = `test-loc-${ts}`;

  beforeAll(async () => {
    author = await createTestUser(`mp-author-${ts}@test.com`, `mpauthor${ts}`);

    // Create a location
    const { data: loc } = await admin.from("locations")
      .insert({ name: `Test Location ${ts}`, slug: locationSlug, post_count: 0 })
      .select("id").single();
    locationId = loc!.id;
    cleanup.locationIds.push(locationId);

    // Create 2 posts at this location
    for (let i = 0; i < 2; i++) {
      const { data: post } = await admin.from("posts")
        .insert({ author_id: author.id, caption: `Test post ${i}`, slug: `map-post-${ts}-${i}`, location_id: locationId })
        .select("id").single();
      cleanup.postIds.push(post!.id);
      await admin.from("post_images").insert({
        post_id: post!.id, storage_path: `posts/test${i}.jpg`,
        alt_text: null, display_order: 0, width: 800, height: 600,
      });
    }
  });

  afterAll(async () => {
    for (const pid of cleanup.postIds) {
      await admin.from("post_images").delete().eq("post_id", pid);
      await admin.from("posts").delete().eq("id", pid);
    }
    for (const lid of cleanup.locationIds) {
      await admin.from("locations").delete().eq("id", lid);
    }
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  test("returns 400 when location param is missing", async () => {
    const { getMapPosts } = await import("@/lib/map-posts");
    const result = await getMapPosts(undefined, admin);
    expect(result.error).toBe("location param required");
  });

  test("returns empty array for unknown location slug", async () => {
    const { getMapPosts } = await import("@/lib/map-posts");
    const result = await getMapPosts("does-not-exist-xyz", admin);
    expect(result.error).toBeUndefined();
    expect(result.posts).toHaveLength(0);
  });

  test("returns posts with image paths for a valid location slug", async () => {
    const { getMapPosts } = await import("@/lib/map-posts");
    const result = await getMapPosts(locationSlug, admin);
    expect(result.error).toBeUndefined();
    expect(result.posts!.length).toBeGreaterThanOrEqual(2);

    const post = result.posts![0];
    expect(post.slug).toBeDefined();
    expect(post.caption).toBeDefined();
    expect(post.imagePath).toBeDefined();
  });
});
