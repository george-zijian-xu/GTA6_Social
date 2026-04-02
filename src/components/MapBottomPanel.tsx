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

/** Renders the card items only — no scroll wrapper. Parent owns the scroll container. */
function PostCardItems({ posts, loading, mobile = false }: { posts: MapPost[]; loading: boolean; mobile?: boolean }) {
  const cardW = mobile ? "min-w-[180px] max-w-[180px] shrink-0" : "min-w-[180px] md:min-w-[240px] max-w-[180px] md:max-w-[240px]";
  const cardH = mobile ? "h-[240px]" : "h-[240px] md:h-[320px]";
  const imgSize = mobile ? 180 : 240;
  const captionSize = mobile ? "text-xs" : "text-sm";
  const padding = mobile ? "p-3" : "p-4";
  const emptyText = mobile ? "text-xs" : "text-xs md:text-sm";

  if (loading) {
    return (
      <>
        {[...Array(mobile ? 3 : 4)].map((_, i) => (
          <div key={i} className={`${cardW} ${cardH} rounded-xl bg-white/50 dark:bg-white/5 animate-pulse`} />
        ))}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`${cardW} ${cardH} flex items-center justify-center bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/5`}>
        <p className={`${emptyText} text-gray-500 dark:text-gray-400`}>No posts yet</p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.slug}`} className={`group ${cardW}`}>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-xl h-full flex flex-col border border-white/20 dark:border-white/5">
            <div className="aspect-square overflow-hidden">
              {post.imagePath ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.imagePath}`}
                  alt={post.caption.slice(0, 40)}
                  width={imgSize}
                  height={imgSize}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5">
                  <span className="material-symbols-outlined text-[32px] text-gray-400">image</span>
                </div>
              )}
            </div>
            <div className={`${padding} flex-1 flex flex-col justify-between`}>
              <h3 className={`font-bold text-gray-900 dark:text-white ${captionSize} leading-snug line-clamp-2`}>
                {post.caption}
              </h3>
              <div className={`flex items-center gap-1 text-gray-500 ${mobile ? "mt-2" : "mt-3"}`}>
                <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
                <span className="text-[10px]">{post.likeCount}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}

export function MapBottomPanel({ location, currentLayer, onLayerToggle }: MapBottomPanelProps) {
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!location) {
      setPosts([]);
      setLoading(false);
      return;
    }
    const id = ++requestIdRef.current;
    setLoading(true);
    fetch(`/api/map-posts?location=${location.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (id === requestIdRef.current) setPosts(data.posts ?? []);
      })
      .finally(() => {
        if (id === requestIdRef.current) setLoading(false);
      });
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
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons);
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      ro.disconnect();
    };
  }, [posts, loading]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
  };

  if (!location) return null;

  return (
    <div className="absolute bottom-2 md:bottom-10 left-2 md:left-10 right-2 md:right-10 z-[999] pointer-events-none">

      {/* Desktop: info card + scrollable posts side by side */}
      <div className="relative hidden md:flex flex-row items-end gap-6 w-full">
        <MapLocationInfoCard location={location} currentLayer={currentLayer} onLayerToggle={onLayerToggle} />
        <div className="relative flex-1 pointer-events-auto">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <PostCardItems posts={posts} loading={loading} />
          </div>
          {canScrollLeft && (
            <button onClick={() => scroll("left")} aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#2a2a2a] transition-colors">
              <span className="material-symbols-outlined text-gray-700 dark:text-white">chevron_left</span>
            </button>
          )}
          {canScrollRight && (
            <button onClick={() => scroll("right")} aria-label="Scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#2a2a2a] transition-colors">
              <span className="material-symbols-outlined text-gray-700 dark:text-white">chevron_right</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile: single scroll row — info card first, then post cards inline */}
      <div className="relative md:hidden pointer-events-auto">
        <div
          className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="min-w-[180px] max-w-[180px] shrink-0">
            <MapLocationInfoCard location={location} currentLayer={currentLayer} onLayerToggle={onLayerToggle} compact />
          </div>
          <PostCardItems posts={posts} loading={loading} mobile />
        </div>
      </div>

    </div>
  );
}
