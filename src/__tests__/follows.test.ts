import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cleanup = { userIds: [] as string[] };

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

describe("Follow", () => {
  const ts = Date.now();
  let userA: { id: string };
  let userB: { id: string };

  beforeAll(async () => {
    userA = await createTestUser(`follow-a-${ts}@test.com`, `followa${ts}`);
    userB = await createTestUser(`follow-b-${ts}@test.com`, `followb${ts}`);
  });

  afterAll(async () => {
    await admin.from("follows").delete().eq("follower_id", userA.id);
    await admin.from("follows").delete().eq("follower_id", userB.id);
    await admin.from("notifications").delete().eq("actor_id", userA.id);
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  test("follow inserts row and creates notification", async () => {
    const { toggleFollow } = await import("@/lib/follows");

    await toggleFollow(userA.id, userB.id, true, admin);

    // Follow row exists
    const { data: row } = await admin
      .from("follows")
      .select("*")
      .eq("follower_id", userA.id)
      .eq("following_id", userB.id)
      .maybeSingle();
    expect(row).toBeTruthy();

    // Notification created
    const { data: notifs } = await admin
      .from("notifications")
      .select("*")
      .eq("type", "follow")
      .eq("actor_id", userA.id)
      .eq("target_user_id", userB.id);
    expect(notifs).toHaveLength(1);
  });

  test("unfollow deletes row", async () => {
    const { toggleFollow } = await import("@/lib/follows");

    await toggleFollow(userA.id, userB.id, false, admin);

    const { data: row } = await admin
      .from("follows")
      .select("*")
      .eq("follower_id", userA.id)
      .eq("following_id", userB.id)
      .maybeSingle();
    expect(row).toBeNull();
  });

  test("self-follow is rejected", async () => {
    const { toggleFollow } = await import("@/lib/follows");

    const result = await toggleFollow(userA.id, userA.id, true, admin);
    expect(result).toBe(false);

    const { data: row } = await admin
      .from("follows")
      .select("*")
      .eq("follower_id", userA.id)
      .eq("following_id", userA.id)
      .maybeSingle();
    expect(row).toBeNull();
  });

  test("follower count is accurate", async () => {
    const { toggleFollow, getFollowerCount } = await import("@/lib/follows");

    // Follow userB
    await toggleFollow(userA.id, userB.id, true, admin);
    const count = await getFollowerCount(userB.id, admin);
    expect(count).toBe(1);

    // Unfollow
    await toggleFollow(userA.id, userB.id, false, admin);
    const count2 = await getFollowerCount(userB.id, admin);
    expect(count2).toBe(0);
  });
});
