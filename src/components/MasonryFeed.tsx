"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Masonry from "react-masonry-css";
import { PostCard } from "./PostCard";
import { fetchFeedPageClient, type FeedPost, type FeedCursor } from "@/lib/feed";

interface MasonryFeedProps {
  initialPosts: FeedPost[];
  initialCursor: FeedCursor | null;
  userId?: string | null;
}

const breakpointColumns = {
  default: 4,
  1280: 4,
  1024: 3,
  640: 2,
  0: 1,
};

export function MasonryFeed({ initialPosts, initialCursor, userId = null }: MasonryFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem("feedSlugs", JSON.stringify(posts.map((p) => p.slug)));
    } catch { /* ignore */ }
  }, [posts]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const { posts: newPosts, nextCursor } = await fetchFeedPageClient(cursor);
      setPosts((prev) => [...prev, ...newPosts]);
      setCursor(nextCursor);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-[48px] text-foreground-muted mb-4">
          explore
        </span>
        <p className="text-foreground-muted text-sm">
          No posts yet. Be the first to share something.
        </p>
      </div>
    );
  }

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} priority={index < 3} userId={userId} />
        ))}
      </Masonry>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef}>
        {loading && (
          <div className="mt-20 mb-10 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin mb-4" />
            <span className="text-[0.65rem] text-foreground-muted uppercase tracking-widest font-bold">
              Fetching more curators...
            </span>
          </div>
        )}
      </div>
    </>
  );
}
