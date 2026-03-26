"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Comment } from "@/lib/post";
import { LikeButton } from "./LikeButton";
import { ReportButton } from "./ReportButton";
import { addComment, containsProfanity } from "@/lib/comments";
import { createClient } from "@/lib/supabase/client";

interface CommentListProps {
  initialComments: Comment[];
  postId: string;
  userId: string | null;
  userAvatarUrl?: string | null;
  actionButtons?: React.ReactNode;
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

export function CommentList({ initialComments, postId, userId, userAvatarUrl, actionButtons }: CommentListProps) {
  const [sort, setSort] = useState<"recent" | "top">("recent");
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  async function handleSortChange(newSort: "recent" | "top") {
    if (newSort === sort) return;
    setSort(newSort);

    const supabase = createClient();
    let query = supabase
      .from("comments")
      .select(`
        id, post_id, author_id, body, like_count, created_at, parent_comment_id,
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
      setComments(data.map((row: any) => mapComment(row)));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mapComment(row: any): Comment {
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
      parentCommentId: row.parent_comment_id ?? null,
    };
  }

  function handleReply(commentId: string, username: string) {
    if (!userId) {
      router.push("/auth/login");
      return;
    }
    setReplyTo({ id: commentId, username });
    setBody(`@${username} `);
    inputRef.current?.focus();
  }

  function cancelReply() {
    setReplyTo(null);
    setBody("");
  }

  async function handleSubmit() {
    if (!userId) {
      router.push("/auth/login");
      return;
    }
    const trimmed = body.trim();
    if (!trimmed || submitting) return;

    // Client-side profanity check for instant feedback
    if (containsProfanity(trimmed)) {
      setError("Your comment contains inappropriate language. Please revise.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const result = await addComment({
        postId,
        authorId: userId,
        body: trimmed,
        parentCommentId: replyTo?.id,
        client: supabase,
      });

      if (!result) {
        setError("Your comment contains inappropriate language. Please revise.");
        setSubmitting(false);
        return;
      }

      // Fetch the full comment with profile info
      const { data: fullComment } = await supabase
        .from("comments")
        .select(`
          id, post_id, author_id, body, like_count, created_at, parent_comment_id,
          profiles!comments_author_id_fkey ( username, display_name, avatar_url )
        `)
        .eq("id", result.id)
        .single();

      if (fullComment) {
        setComments((prev) => [mapComment(fullComment), ...prev]);
      }

      setBody("");
      setReplyTo(null);
    } catch {
      setError("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Group comments: top-level and replies
  const topLevel = comments.filter((c) => !c.parentCommentId);
  const replies = comments.filter((c) => c.parentCommentId);
  const repliesByParent = new Map<string, Comment[]>();
  for (const r of replies) {
    const existing = repliesByParent.get(r.parentCommentId!) ?? [];
    existing.push(r);
    repliesByParent.set(r.parentCommentId!, existing);
  }

  function renderComment(comment: Comment, indented: boolean) {
    return (
      <div key={comment.id} className={`flex gap-3 ${indented ? "ml-10" : ""}`}>
        <Link href={`/users/${comment.username}`} className="shrink-0">
          {comment.avatarUrl ? (
            <Image
              src={comment.avatarUrl}
              alt={comment.displayName ?? comment.username}
              width={32}
              height={32}
              className="rounded-full w-8 h-8 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px] text-foreground-muted">person</span>
            </div>
          )}
        </Link>
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
          <p className="text-sm text-foreground mt-0.5">{comment.body}</p>
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
            <button
              onClick={() => handleReply(comment.id, comment.username)}
              className="text-[11px] font-semibold text-foreground-muted hover:text-foreground transition-colors"
            >
              Reply
            </button>
            {userId && userId !== comment.authorId && (
              <ReportButton commentId={comment.id} />
            )}
          </div>
        </div>
      </div>
    );
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
                sort === s ? "text-primary" : "text-foreground-muted hover:text-foreground"
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
          topLevel.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment, false)}
              {repliesByParent.get(comment.id)?.map((reply) =>
                renderComment(reply, true)
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment input with action buttons */}
      <div className="pt-4 border-t border-foreground/5 mt-4">
        {error && (
          <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary text-xs">
            {error}
          </div>
        )}
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 text-xs text-foreground-muted">
            <span>Replying to @{replyTo.username}</span>
            <button onClick={cancelReply} className="text-primary hover:text-primary-hover">
              Cancel
            </button>
          </div>
        )}
        {userId ? (
          <div className="flex items-center gap-3">
            {/* Current user avatar */}
            <div className="shrink-0">
              {userAvatarUrl ? (
                <Image src={userAvatarUrl} alt="" width={32} height={32} className="rounded-full w-8 h-8 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-foreground-muted">person</span>
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Add a comment…"
                disabled={submitting}
                className="w-full rounded-xl bg-surface-secondary dark:bg-[#2a2a2a] px-4 py-2.5 pr-16 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none overflow-hidden"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !body.trim()}
                className="absolute right-2 top-2 px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-50 hover:bg-primary-hover transition-colors"
              >
                POST
              </button>
            </div>
            {actionButtons && (
              <div className="flex items-center gap-4 shrink-0">
                {actionButtons}
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="block text-center py-3 text-sm text-foreground-muted hover:text-primary transition-colors"
          >
            Log in to comment
          </Link>
        )}
      </div>
    </div>
  );
}
