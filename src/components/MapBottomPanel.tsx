"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { MapLocation } from "@/lib/locations";
import type { MapPost } from "@/lib/map-posts";
import { MapLocationInfoCard } from "./MapLocationInfoCard";

interface MapBottomPanelProps {
  location: MapLocation | null;
  currentLayer: "game" | "real";
  onLayerToggle: (layer: "game" | "real") => void;
}

export function MapBottomPanel({ location, currentLayer, onLayerToggle }: MapBottomPanelProps) {
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!location) { setPosts([]); return; }
    setLoading(true);
    fetch(`/api/map-posts?location=${location.slug}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }, [location?.slug]);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollButtons);
      return () => el.removeEventListener("scroll", updateScrollButtons);
    }
  }, [posts]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!location) return null;

  return (
    <div className="absolute bottom-10 left-10 right-10 z-[999] pointer-events-none">
      <div className="relative flex items-end gap-6 w-full max-w-full">
        <MapLocationInfoCard
          location={location}
          currentLayer={currentLayer}
          onLayerToggle={onLayerToggle}
        />

        <div className="relative flex-1 pointer-events-auto">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[240px] max-w-[240px] h-[320px] rounded-xl bg-white/50 dark:bg-white/5 animate-pulse" />
              ))
            ) : posts.length === 0 ? (
              <div className="min-w-[240px] h-[320px] flex items-center justify-center bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">No posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.slug}`} className="group min-w-[240px] max-w-[240px]">
                  <div className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-xl h-full flex flex-col border border-white/20 dark:border-white/5">
                    <div className="aspect-square overflow-hidden">
                      {post.imagePath ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.imagePath}`}
                          alt={post.caption.slice(0, 40)}
                          width={240}
                          height={240}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5">
                          <span className="material-symbols-outlined text-[32px] text-gray-400">image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                        {post.caption}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 mt-3">
                        <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          favorite
                        </span>
                        <span className="text-[10px]">{post.likeCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <span className="material-symbols-outlined text-gray-700 dark:text-white">chevron_left</span>
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <span className="material-symbols-outlined text-gray-700 dark:text-white">chevron_right</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
