"use client";

import { useState } from "react";
import Link from "next/link";
import type { Comment } from "@/lib/post";
import { LikeButton } from "./LikeButton";

interface CommentListProps {
  initialComments: Comment[];
  postId: string;
  userId: string | null;
}

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

export function CommentList({ initialComments, postId, userId }: CommentListProps) {
  const [sort, setSort] = useState<"recent" | "top">("recent");
  const [comments, setComments] = useState(initialComments);

  async function handleSortChange(newSort: "recent" | "top") {
    if (newSort === sort) return;
    setSort(newSort);

    // Fetch re-sorted comments from client
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    let query = supabase
      .from("comments")
      .select(`
        id, post_id, author_id, body, like_count, created_at,
        profiles!comments_author_id_fkey ( username, display_name, avatar_url )
      `)
      .eq("post_id", postId);

    if (newSort === "top") {
      query = query.order("like_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data } = await query;
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setComments(data.map((row: any) => {
        const profile = row.profiles;
        return {
          id: row.id,
          postId: row.post_id,
          authorId: row.author_id,
          body: row.body,
          likeCount: row.like_count,
          createdAt: row.created_at,
          username: profile?.username ?? "",
          displayName: profile?.display_name ?? null,
          avatarUrl: profile?.avatar_url ?? null,
        };
      }));
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground-muted">
          Discussion ({comments.length})
        </h3>
        <div className="flex gap-3">
          {(["recent", "top"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleSortChange(s)}
              className={`text-xs font-semibold capitalize transition-colors ${
                sort === s
                  ? "text-primary"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        {comments.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-8">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <Link href={`/users/${comment.username}`} className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-foreground-muted">
                    person
                  </span>
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/users/${comment.username}`}
                    className="text-[13px] font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {comment.displayName ?? comment.username}
                  </Link>
                  <span className="text-[10px] text-foreground-muted">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-0.5">
                  {comment.body}
                </p>
                <div className="flex items-center gap-4 mt-1.5">
                  <LikeButton
                    targetId={comment.id}
                    targetType="comment"
                    initialCount={comment.likeCount}
                    initialLiked={false}
                    userId={userId}
                    iconSize="text-[14px]"
                    textSize="text-[11px]"
                  />
                  <button className="text-[11px] font-semibold text-foreground-muted hover:text-foreground transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
