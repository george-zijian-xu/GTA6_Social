"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { FollowButton } from "@/components/FollowButton";
import { UserPostGrid } from "@/components/UserPostGrid";
import { createClient } from "@/lib/supabase/client";
import { search } from "@/lib/search";
import { formatCount } from "@/lib/format";
import type { SearchResults as SearchResultsType } from "@/lib/search";
import type { FeedPost } from "@/lib/feed";

interface SearchResultsProps {
  initialQuery: string;
  initialResults: SearchResultsType;
  userId: string | null;
}

export function SearchResults({ initialQuery, initialResults, userId }: SearchResultsProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ posts: [], users: [] });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const r = await search(q, supabase, userId ?? undefined);
      setResults(r);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Debounce: 350ms after last keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query);
      // Update URL without navigation
      const url = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search";
      router.replace(url, { scroll: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.posts.length + results.users.length;
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-foreground-muted">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts and people..."
          autoFocus
          className="w-full rounded-full bg-surface-secondary dark:bg-[#2a2a2a] pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin" />
        )}
      </div>

      {!hasQuery && (
        <p className="text-center text-foreground-muted text-sm py-12">
          Start typing to search posts and people.
        </p>
      )}

      {hasQuery && !loading && totalResults === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[40px] text-foreground-muted mb-3">
            search_off
          </span>
          <p className="text-foreground-muted text-sm">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {/* Users section */}
      {results.users.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-4">
            People ({results.users.length})
          </h2>
          <div className="space-y-3">
            {results.users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-secondary dark:hover:bg-white/5 transition-colors">
                <Link href={`/users/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-foreground-muted">person</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.displayName ?? user.username}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      @{user.username} · {formatCount(user.followerCount)} followers
                    </p>
                  </div>
                </Link>
                <FollowButton
                  targetUserId={user.id}
                  currentUserId={userId}
                  initialFollowing={false}
                  initialCount={user.followerCount}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Posts section */}
      {results.posts.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-4">
            Posts ({results.posts.length})
          </h2>
          <UserPostGrid posts={results.posts} />
        </section>
      )}
    </div>
  );
}
