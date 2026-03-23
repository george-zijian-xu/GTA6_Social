import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS for admin operations
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin ? user : null;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { action, targetId } = body;
  const adminClient = getAdminClient();

  switch (action) {
    case "delete_post": {
      await adminClient.from("posts").delete().eq("id", targetId);
      return NextResponse.json({ ok: true });
    }

    case "delete_comment": {
      await adminClient.from("comments").delete().eq("id", targetId);
      return NextResponse.json({ ok: true });
    }

    case "ban_user": {
      // Set banned_at
      await adminClient
        .from("profiles")
        .update({ banned_at: new Date().toISOString() })
        .eq("id", targetId);
      // Sign out the user
      await adminClient.auth.admin.signOut(targetId);
      return NextResponse.json({ ok: true });
    }

    case "unban_user": {
      await adminClient
        .from("profiles")
        .update({ banned_at: null })
        .eq("id", targetId);
      return NextResponse.json({ ok: true });
    }

    case "toggle_admin": {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("is_admin")
        .eq("id", targetId)
        .single();
      await adminClient
        .from("profiles")
        .update({ is_admin: !profile?.is_admin })
        .eq("id", targetId);
      return NextResponse.json({ ok: true });
    }

    case "dismiss_report": {
      await adminClient
        .from("reports")
        .update({ status: "reviewed" })
        .eq("id", targetId);
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
