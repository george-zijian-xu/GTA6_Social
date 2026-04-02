import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import { AdminQueue } from "./AdminQueue";

export const metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const admin = await isAdmin(user.id, supabase);
  if (!admin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-[48px] text-foreground-muted mb-4">lock</span>
        <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-sm text-foreground-muted">This area is restricted to administrators.</p>
      </div>
    );
  }

  // Fetch pending reports with admin client
  const serviceClient = getServiceClient();
  const { data: reports } = await serviceClient
    .from("reports")
    .select(`
      id, reason, status, created_at,
      post_id, comment_id,
      reporter:profiles!reports_reporter_id_fkey ( username ),
      posts ( slug, caption, author_id ),
      comments ( body, author_id ),
      reported_user:profiles!reports_reporter_id_fkey ( username )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch users list
  const { data: users } = await serviceClient
    .from("profiles")
    .select("id, username, display_name, is_admin, banned_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Admin Panel</h1>
      <AdminQueue reports={reports ?? []} users={users ?? []} />
    </div>
  );
}
