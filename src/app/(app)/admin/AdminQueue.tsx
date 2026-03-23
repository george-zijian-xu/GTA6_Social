"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Report {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reporter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comments: any;
}

interface User {
  id: string;
  username: string;
  display_name: string | null;
  is_admin: boolean;
  banned_at: string | null;
}

interface AdminQueueProps {
  reports: Report[];
  users: User[];
}

async function adminAction(action: string, targetId: string) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, targetId }),
  });
  return res.ok;
}

function timeAgo(dateStr: string) {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  return d === 0 ? "today" : `${d}d ago`;
}

export function AdminQueue({ reports: initial, users: initialUsers }: AdminQueueProps) {
  const [reports, setReports] = useState(initial);
  const [users, setUsers] = useState(initialUsers);
  const [tab, setTab] = useState<"reports" | "users">("reports");
  const router = useRouter();

  async function handleDismiss(id: string) {
    await adminAction("dismiss_report", id);
    setReports((r) => r.filter((x) => x.id !== id));
  }

  async function handleDeletePost(reportId: string, postId: string) {
    await adminAction("delete_post", postId);
    setReports((r) => r.filter((x) => x.id !== reportId));
    router.refresh();
  }

  async function handleDeleteComment(reportId: string, commentId: string) {
    await adminAction("delete_comment", commentId);
    setReports((r) => r.filter((x) => x.id !== reportId));
  }

  async function handleBan(userId: string, isBanned: boolean) {
    await adminAction(isBanned ? "unban_user" : "ban_user", userId);
    setUsers((u) => u.map((x) => x.id === userId ? { ...x, banned_at: isBanned ? null : new Date().toISOString() } : x));
  }

  async function handleToggleAdmin(userId: string) {
    await adminAction("toggle_admin", userId);
    setUsers((u) => u.map((x) => x.id === userId ? { ...x, is_admin: !x.is_admin } : x));
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-6 border-b border-foreground/5 mb-6">
        {(["reports", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
              tab === t ? "border-primary text-primary" : "border-transparent text-foreground-muted"
            }`}
          >
            {t === "reports" ? `Pending Reports (${reports.length})` : `Users (${users.length})`}
          </button>
        ))}
      </div>

      {/* Reports */}
      {tab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 && (
            <p className="text-sm text-foreground-muted text-center py-12">No pending reports.</p>
          )}
          {reports.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-surface-card dark:bg-[#1e1e1e] border border-foreground/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground-muted mb-1">
                    Reported by <span className="font-bold">@{r.reporter?.username}</span> · {timeAgo(r.created_at)}
                  </p>
                  <p className="text-sm font-semibold text-foreground mb-1">{r.reason}</p>
                  {r.posts && (
                    <p className="text-xs text-foreground-muted truncate">
                      Post: &ldquo;{r.posts.caption?.slice(0, 80)}&rdquo;
                    </p>
                  )}
                  {r.comments && (
                    <p className="text-xs text-foreground-muted truncate">
                      Comment: &ldquo;{r.comments.body?.slice(0, 80)}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDismiss(r.id)}
                    className="px-3 py-1 rounded-full bg-surface-secondary text-xs font-semibold text-foreground-muted hover:text-foreground"
                  >
                    Dismiss
                  </button>
                  {r.post_id && (
                    <button
                      onClick={() => handleDeletePost(r.id, r.post_id!)}
                      className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      Delete Post
                    </button>
                  )}
                  {r.comment_id && (
                    <button
                      onClick={() => handleDeleteComment(r.id, r.comment_id!)}
                      className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      Delete Comment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-secondary dark:hover:bg-white/5">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">@{u.username}</span>
                {u.display_name && <span className="ml-2 text-xs text-foreground-muted">{u.display_name}</span>}
                {u.is_admin && <span className="ml-2 text-[10px] text-primary font-bold uppercase tracking-wide">Admin</span>}
                {u.banned_at && <span className="ml-2 text-[10px] text-orange-500 font-bold uppercase tracking-wide">Banned</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBan(u.id, !!u.banned_at)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    u.banned_at
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {u.banned_at ? "Unban" : "Ban"}
                </button>
                <button
                  onClick={() => handleToggleAdmin(u.id)}
                  className="px-3 py-1 rounded-full bg-surface-secondary text-xs font-semibold text-foreground-muted hover:text-foreground"
                >
                  {u.is_admin ? "Demote" : "Promote"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
