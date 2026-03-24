"use client";

import { useEffect, useState } from "react";
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

  // ↑/↓ keyboard shortcuts for prev/next post
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp" && prevSlug) {
        e.preventDefault();
        router.push(`/posts/${prevSlug}`);
      }
      if (e.key === "ArrowDown" && nextSlug) {
        e.preventDefault();
        router.push(`/posts/${nextSlug}`);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevSlug, nextSlug, router]);

  return (
    <div className="absolute top-4 left-4 z-10 pointer-events-none">
      <button
        onClick={() => router.push("/")}
        className="pointer-events-auto w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-foreground/20 transition-colors"
        aria-label="Back to feed"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>
    </div>
  );
}
