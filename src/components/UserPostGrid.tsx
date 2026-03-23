"use client";

import Masonry from "react-masonry-css";
import { PostCard } from "@/components/PostCard";
import type { FeedPost } from "@/lib/feed";

interface UserPostGridProps {
  posts: FeedPost[];
}

const breakpointColumns = { default: 3, 1024: 3, 640: 2, 0: 1 };

export function UserPostGrid({ posts }: UserPostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-[48px] text-foreground-muted mb-4">
          photo_library
        </span>
        <p className="text-foreground-muted text-sm">No posts yet.</p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Masonry>
  );
}
