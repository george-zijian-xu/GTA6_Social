import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getNotifications, markAsRead } from "@/lib/notifications";
import { NotificationTabs } from "./NotificationTabs";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch all 3 types
  const [likes, comments, follows] = await Promise.all([
    getNotifications(user.id, "like", supabase),
    getNotifications(user.id, "comment", supabase),
    getNotifications(user.id, "follow", supabase),
  ]);

  // Mark all as read
  await markAsRead(user.id, supabase);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Notifications</h1>
      <NotificationTabs likes={likes} comments={comments} follows={follows} />
    </div>
  );
}
