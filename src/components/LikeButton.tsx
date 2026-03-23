"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { togglePostLike, toggleCommentLike } from "@/lib/likes";
import { formatCount } from "@/lib/format";

interface LikeButtonProps {
  targetId: string;
  targetType: "post" | "comment";
  initialCount: number;
  initialLiked: boolean;
  userId: string | null;
  iconSize?: string;
  textSize?: string;
}

export function LikeButton({
  targetId,
  targetType,
  initialCount,
  initialLiked,
  userId,
  iconSize = "text-[20px]",
  textSize = "text-sm",
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleClick() {
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => c + (newLiked ? 1 : -1));

    startTransition(async () => {
      try {
        const supabase = createClient();
        if (targetType === "post") {
          await togglePostLike(targetId, userId, newLiked, supabase);
        } else {
          await toggleCommentLike(targetId, userId, newLiked, supabase);
        }
      } catch {
        // Rollback on failure
        setLiked(!newLiked);
        setCount((c) => c + (newLiked ? -1 : 1));
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1 transition-colors ${
        liked
          ? "text-primary"
          : "text-foreground-muted hover:text-primary"
      }`}
    >
      <span
        className={`material-symbols-outlined ${iconSize}`}
        style={liked ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
      >
        favorite
      </span>
      <span className={`${textSize} font-medium`}>
        {formatCount(count)}
      </span>
    </button>
  );
}
