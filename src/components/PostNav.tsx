"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PostNavProps {
  currentSlug: string;
}

export function PostNav({ currentSlug }: PostNavProps) {
  const [prevSlug, setPrevSlug] = useState<string | null>(null);
  const [nextSlug, setNextSlug] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("feedSlugs");
      if (!raw) return;
      const slugs: string[] = JSON.parse(raw);
      const i = slugs.indexOf(currentSlug);
      if (i === -1) return;
      setPrevSlug(i > 0 ? slugs[i - 1] : null);
      setNextSlug(i < slugs.length - 1 ? slugs[i + 1] : null);
    } catch { /* ignore */ }
  }, [currentSlug]);

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
      {/* Back to feed */}
      <button
        onClick={() => router.back()}
        className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label="Back"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>

      {/* Prev / Next */}
      <div className="pointer-events-auto flex gap-2">
        {prevSlug ? (
          <Link
            href={`/posts/${prevSlug}`}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label="Previous post"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </Link>
        ) : (
          <div className="w-10 h-10" />
        )}
        {nextSlug ? (
          <Link
            href={`/posts/${nextSlug}`}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label="Next post"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </div>
  );
}
