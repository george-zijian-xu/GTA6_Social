"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toggleFollow } from "@/lib/follows";
import { formatCount } from "@/lib/format";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string | null;
  initialFollowing: boolean;
  initialCount: number;
}

export function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
  initialCount,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleClick() {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    const newFollowing = !following;
    setFollowing(newFollowing);
    setCount((c) => c + (newFollowing ? 1 : -1));

    startTransition(async () => {
      try {
        const supabase = createClient();
        await toggleFollow(currentUserId, targetUserId, newFollowing, supabase);
      } catch {
        setFollowing(!newFollowing);
        setCount((c) => c + (newFollowing ? -1 : 1));
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
        following
          ? "bg-surface-secondary dark:bg-white/10 text-foreground hover:bg-red-50 hover:text-primary dark:hover:bg-primary/10"
          : "bg-primary hover:bg-primary-hover text-white"
      }`}
    >
      {following ? "Following" : "Follow"}
      {count > 0 && (
        <span className="ml-1.5 text-xs font-normal opacity-70">
          {formatCount(count)}
        </span>
      )}
    </button>
  );
}
