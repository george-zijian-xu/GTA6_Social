"use client";

import { useState } from "react";
import Link from "next/link";
import type { Notification } from "@/lib/notifications";

interface NotificationTabsProps {
  likes: Notification[];
  comments: Notification[];
  follows: Notification[];
}

type Tab = "comments" | "likes" | "follows";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

function getDescription(n: Notification): string {
  switch (n.type) {
    case "like":
      return `liked your post${n.postCaption ? `: "${n.postCaption.slice(0, 40)}..."` : ""}`;
    case "comment":
      return `commented${n.commentBody ? `: "${n.commentBody.slice(0, 40)}..."` : " on your post"}`;
    case "follow":
      return "started following you";
  }
}

function getHref(n: Notification): string {
  if (n.type === "follow") return `/users/${n.actorUsername}`;
  if (n.postSlug) return `/posts/${n.postSlug}`;
  return "#";
}

function NotificationItem({ n }: { n: Notification }) {
  return (
    <Link
      href={getHref(n)}
      className={`flex gap-3 p-4 rounded-xl transition-colors hover:bg-surface-secondary dark:hover:bg-white/5 ${
        !n.readAt ? "bg-primary/5" : ""
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[18px] text-foreground-muted">
          person
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-bold">{n.actorDisplayName ?? n.actorUsername}</span>{" "}
          {getDescription(n)}
        </p>
        <span className="text-[11px] text-foreground-muted">{timeAgo(n.createdAt)}</span>
      </div>

      {/* Post thumbnail placeholder for like/comment */}
      {n.type !== "follow" && n.postSlug && (
        <div className="w-12 h-12 rounded-lg bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[16px] text-foreground-muted">image</span>
        </div>
      )}
    </Link>
  );
}

function EmptyState({ type }: { type: string }) {
  const icons: Record<string, string> = {
    comments: "chat_bubble_outline",
    likes: "favorite_border",
    follows: "person_add",
  };
  return (
    <div className="text-center py-16">
      <span className="material-symbols-outlined text-[40px] text-foreground-muted mb-3">
        {icons[type] ?? "notifications_none"}
      </span>
      <p className="text-sm text-foreground-muted">No {type} yet.</p>
    </div>
  );
}

export function NotificationTabs({ likes, comments, follows }: NotificationTabsProps) {
  const [tab, setTab] = useState<Tab>("comments");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "comments", label: "Comments", count: comments.length },
    { key: "likes", label: "Likes", count: likes.length },
    { key: "follows", label: "New Follows", count: follows.length },
  ];

  const current = tab === "comments" ? comments : tab === "likes" ? likes : follows;

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-foreground/5 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-1">
        {current.length === 0 ? (
          <EmptyState type={tab} />
        ) : (
          current.map((n) => <NotificationItem key={n.id} n={n} />)
        )}
      </div>
    </div>
  );
}
