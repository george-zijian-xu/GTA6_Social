import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { mapFeedRow } from "@/lib/feed";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── Behavior 1: mapFeedRow maps post_type to postType ───────────────────────

describe("mapFeedRow — postType field", () => {
  test("maps post_type 'GG' from raw DB row to postType on FeedPost", () => {
    const row = {
      id: "1",
      author_id: "a",
      title: null,
      caption: "test",
      slug: "test",
      location_id: null,
      like_count: 0,
      comment_count: 0,
      created_at: "2025-01-01T00:00:00Z",
      score: 0,
      username: "user1",
      display_name: null,
      avatar_url: null,
      image_path: null,
      image_alt: null,
      image_width: null,
      image_height: null,
      location_name: null,
      location_slug: null,
      viewer_liked: false,
      post_type: "GG",
    };

    const post = mapFeedRow(row);
    expect(post.postType).toBe("GG");
  });

  test("maps all valid post_type values correctly", () => {
    const types = ["GG", "GR", "RG", "RR", "NON_CANON"] as const;
    for (const type of types) {
      const post = mapFeedRow({ post_type: type } as never);
      expect(post.postType).toBe(type);
    }
  });
});

// ─── Behaviors 2-4: createPost + getPostBySlug integration ───────────────────

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

describe("post_type — createPost + getPostBySlug integration", () => {
  const ts = Date.now();
  let author: { id: string };

  beforeAll(async () => {
    author = await createTestUser(`pt-author-${ts}@test.com`, `ptauthor${ts}`);
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

  test("createPost stores postType and getPostBySlug returns it", async () => {
    const { createPost } = await import("@/lib/publish");
    const { getPostBySlug } = await import("@/lib/post");

    const result = await createPost({
      authorId: author.id,
      caption: "Chilling at Vice Beach GG",
      postType: "GG",
      images: [],
      client: admin,
    });

    expect(result).toBeTruthy();
    cleanup.postIds.push(result!.id);

    const detail = await getPostBySlug(result!.slug, admin);
    expect(detail).toBeTruthy();
    expect(detail!.postType).toBe("GG");
  });

  test("createPost without postType defaults to RR", async () => {
    const { createPost } = await import("@/lib/publish");
    const { getPostBySlug } = await import("@/lib/post");

    const result = await createPost({
      authorId: author.id,
      caption: "No type specified defaults",
      images: [],
      client: admin,
    });

    expect(result).toBeTruthy();
    cleanup.postIds.push(result!.id);

    const detail = await getPostBySlug(result!.slug, admin);
    expect(detail!.postType).toBe("RR");
  });

  test("createPost stores NON_CANON post_type", async () => {
    const { createPost } = await import("@/lib/publish");
    const { getPostBySlug } = await import("@/lib/post");

    const result = await createPost({
      authorId: author.id,
      caption: "This is a meme post",
      postType: "NON_CANON",
      images: [],
      client: admin,
    });

    expect(result).toBeTruthy();
    cleanup.postIds.push(result!.id);

    const detail = await getPostBySlug(result!.slug, admin);
    expect(detail!.postType).toBe("NON_CANON");
  });
});
