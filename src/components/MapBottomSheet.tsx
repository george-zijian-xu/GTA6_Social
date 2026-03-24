"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { MapLocation } from "@/lib/locations";
import type { MapPost } from "@/lib/map-posts";

interface MapBottomSheetProps {
  location: MapLocation | null;
  onClose: () => void;
}

export function MapBottomSheet({ location, onClose }: MapBottomSheetProps) {
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) { setPosts([]); return; }
    setLoading(true);
    fetch(`/api/map-posts?location=${location.slug}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }, [location?.slug]);

  const visible = location !== null;

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div className="absolute inset-0 z-[998]" onClick={onClose} />
      )}

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-[999] bg-surface-card dark:bg-[#1e1e1e]
          rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out
          ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "60%" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">
              {location?.name ?? ""}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              {location?.category && (
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                  {location.category}
                </span>
              )}
              {location?.category && <span className="text-foreground/20 text-xs">·</span>}
              <span className="text-[11px] text-foreground-muted">
                {location?.postCount ?? 0} posts
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-1 italic">
              Leonida, State of Florida
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-secondary dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-foreground-muted">close</span>
          </button>
        </div>

        {/* Post thumbnails */}
        <div className="px-5 pb-6 overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="flex items-center gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-28 h-36 rounded-xl bg-surface-secondary dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-foreground-muted py-2">No posts from this location yet.</p>
          ) : (
            <div className="flex gap-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="flex-shrink-0 w-28 group"
                >
                  <div className="w-28 h-36 rounded-xl overflow-hidden bg-surface-secondary dark:bg-white/5 relative mb-1.5">
                    {post.imagePath ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.imagePath}`}
                        alt={post.caption.slice(0, 40)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-foreground-muted/30">
                          image
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-foreground-muted line-clamp-2 leading-tight">
                    {post.caption}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
