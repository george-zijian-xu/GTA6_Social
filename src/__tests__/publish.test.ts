import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

describe("Publish", () => {
  const ts = Date.now();
  let author: { id: string };

  beforeAll(async () => {
    author = await createTestUser(`pub-author-${ts}@test.com`, `pubauthor${ts}`);
  });

  afterAll(async () => {
    for (const pid of cleanup.postIds) {
      await admin.from("post_images").delete().eq("post_id", pid);
      await admin.from("posts").delete().eq("id", pid);
    }
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  test("createPost inserts post and image rows", async () => {
    const { createPost } = await import("@/lib/publish");

    const result = await createPost({
      authorId: author.id,
      caption: "Sunset at Vice Beach",
      images: [
        { storagePath: "posts/test1.jpg", width: 800, height: 600 },
        { storagePath: "posts/test2.jpg", width: 1200, height: 900 },
      ],
      client: admin,
    });

    expect(result).toBeTruthy();
    expect(result!.slug).toContain("sunset-at-vice-beach");
    cleanup.postIds.push(result!.id);

    // Verify post row
    const { data: post } = await admin
      .from("posts")
      .select("*")
      .eq("id", result!.id)
      .single();
    expect(post).toBeTruthy();
    expect(post!.caption).toBe("Sunset at Vice Beach");

    // Verify image rows
    const { data: images } = await admin
      .from("post_images")
      .select("*")
      .eq("post_id", result!.id)
      .order("display_order");
    expect(images).toHaveLength(2);
    expect(images![0].display_order).toBe(0);
    expect(images![1].display_order).toBe(1);
    expect(images![0].width).toBe(800);
  });

  test("slug uniqueness is handled with suffix", async () => {
    const { createPost } = await import("@/lib/publish");

    const post1 = await createPost({
      authorId: author.id,
      caption: "Duplicate Title Test",
      images: [],
      client: admin,
    });
    cleanup.postIds.push(post1!.id);

    const post2 = await createPost({
      authorId: author.id,
      caption: "Duplicate Title Test",
      images: [],
      client: admin,
    });
    cleanup.postIds.push(post2!.id);

    expect(post1!.slug).not.toBe(post2!.slug);
    expect(post2!.slug).toContain("duplicate-title-test");
  });

  test("profanity filter rejects caption", async () => {
    const { createPost } = await import("@/lib/publish");

    const result = await createPost({
      authorId: author.id,
      caption: "This is a damn post",
      images: [],
      client: admin,
    });

    expect(result).toBeNull();
  });
});
