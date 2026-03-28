"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { MapLocation } from "@/lib/locations";
import type { MapPost } from "@/lib/map-posts";
import { MapLocationInfoCard } from "./MapLocationInfoCard";

interface MapBottomPanelProps {
  location: MapLocation | null;
  onClose: () => void;
}

export function MapBottomPanel({ location, onClose }: MapBottomPanelProps) {
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
    const amount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const visible = location !== null;

  return (
    <>
      {visible && <div className="absolute inset-0 z-[998]" onClick={onClose} />}

      <div
        className={`absolute bottom-0 left-0 right-0 z-[999] transition-transform duration-300 ease-out pointer-events-none
          ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="relative flex items-end gap-6 w-full p-10 overflow-hidden">
          {location && <MapLocationInfoCard location={location} />}

          <div className="flex-1 relative pointer-events-auto">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all"
              >
                <span className="material-symbols-outlined text-gray-700 dark:text-white">chevron_left</span>
              </button>
            )}

            <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="min-w-[240px] max-w-[240px] h-[320px] rounded-xl bg-white/90 dark:bg-[#1e1e1e]/90 animate-pulse" />
                ))
              ) : (
                posts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.slug}`} className="group cursor-pointer min-w-[240px] max-w-[240px]">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-xl h-full flex flex-col border border-white/20 dark:border-white/5">
                      <div className="aspect-square overflow-hidden relative">
                        {post.imagePath ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.imagePath}`}
                            alt={post.caption.slice(0, 40)}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-white/5" />
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2">
                          {post.caption}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-500 mt-3">
                          <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                          <span className="text-[10px]">{post.likeCount}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all"
              >
                <span className="material-symbols-outlined text-gray-700 dark:text-white">chevron_right</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
