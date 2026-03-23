import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cleanup = { userIds: [] as string[], notifIds: [] as string[] };

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

describe("Notifications", () => {
  const ts = Date.now();
  let targetUser: { id: string };
  let actor: { id: string };

  beforeAll(async () => {
    targetUser = await createTestUser(`notif-target-${ts}@test.com`, `notiftarget${ts}`);
    actor = await createTestUser(`notif-actor-${ts}@test.com`, `notifactor${ts}`);

    // Seed 3 notifications (one of each type)
    const notifs = [
      { type: "like", actor_id: actor.id, target_user_id: targetUser.id },
      { type: "comment", actor_id: actor.id, target_user_id: targetUser.id },
      { type: "follow", actor_id: actor.id, target_user_id: targetUser.id },
    ];
    const { data } = await admin.from("notifications").insert(notifs).select("id");
    if (data) cleanup.notifIds.push(...data.map((n) => n.id));
  });

  afterAll(async () => {
    for (const nid of cleanup.notifIds) {
      await admin.from("notifications").delete().eq("id", nid);
    }
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  test("fetches notifications filtered by type", async () => {
    const { getNotifications } = await import("@/lib/notifications");

    const likes = await getNotifications(targetUser.id, "like", admin);
    expect(likes.length).toBeGreaterThanOrEqual(1);
    expect(likes.every((n) => n.type === "like")).toBe(true);

    const comments = await getNotifications(targetUser.id, "comment", admin);
    expect(comments.length).toBeGreaterThanOrEqual(1);

    const follows = await getNotifications(targetUser.id, "follow", admin);
    expect(follows.length).toBeGreaterThanOrEqual(1);
  });

  test("markAsRead updates read_at", async () => {
    const { markAsRead, getUnreadCount } = await import("@/lib/notifications");

    // Unread count should be > 0
    const before = await getUnreadCount(targetUser.id, admin);
    expect(before).toBeGreaterThanOrEqual(3);

    // Mark all as read
    await markAsRead(targetUser.id, admin);

    // Unread count should be 0
    const after = await getUnreadCount(targetUser.id, admin);
    expect(after).toBe(0);
  });
});
