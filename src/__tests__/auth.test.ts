import { describe, test, expect, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123!";

describe("Auth", () => {
  let testUserId: string | undefined;

  afterAll(async () => {
    if (testUserId) {
      // Clean up: delete profile first (cascade should handle it, but be safe)
      await adminClient.from("profiles").delete().eq("id", testUserId);
      await adminClient.auth.admin.deleteUser(testUserId);
    }
  });

  test("signup creates a profile row", async () => {
    // Use admin API to create a confirmed user (avoids email confirmation requirement)
    const { data, error } = await adminClient.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { username: `testuser${Date.now()}` },
    });
    expect(error).toBeNull();
    expect(data.user).toBeTruthy();
    testUserId = data.user!.id;

    // Profile should be auto-created by the DB trigger
    const { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", data.user!.id)
      .single();
    expect(profile).toBeTruthy();
    expect(profile!.username).toBeTruthy();
  });

  test("login returns a valid session", async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    expect(error).toBeNull();
    expect(data.session).toBeTruthy();
    expect(data.session!.access_token).toBeTruthy();
  });

  test("logout clears the session", async () => {
    await supabase.auth.signOut();
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
  });

  test("unauthenticated query returns no notifications (RLS)", async () => {
    const freshClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await freshClient.from("notifications").select("*");
    expect(data).toEqual([]);
  });
});
