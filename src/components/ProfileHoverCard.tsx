"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatCount } from "@/lib/format";

interface ProfileData {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number;
  recentImages: string[];
}

interface ProfileHoverCardProps {
  username: string;
  children: ReactNode;
}

export function ProfileHoverCard({ username, children }: ProfileHoverCardProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const fetchedRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);

    const supabase = createClient();

    // Fetch profile + follower count + recent post images
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("username", username)
      .single();

    if (!profileRow) {
      setLoading(false);
      return;
    }

    const { count: followerCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileRow.username);

    // Get 3 recent post images
    const { data: recentPosts } = await supabase
      .from("posts")
      .select("id, post_images ( storage_path )")
      .eq("author_id", username)
      .order("created_at", { ascending: false })
      .limit(3);

    const recentImages: string[] = [];
    if (recentPosts) {
      for (const post of recentPosts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imgs = post.post_images as any[];
        if (imgs?.[0]?.storage_path) {
          recentImages.push(imgs[0].storage_path);
        }
      }
    }

    setProfile({
      username: profileRow.username,
      displayName: profileRow.display_name,
      avatarUrl: profileRow.avatar_url,
      followerCount: followerCount ?? 0,
      recentImages,
    });
    setLoading(false);
  }, [username]);

  function handleMouseEnter() {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      fetchProfile();
    }, 300);
  }

  function handleMouseLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {visible && (
        <div className="absolute left-0 top-full mt-2 z-50 w-[272px] bg-surface-card dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-foreground/5 p-4 animate-in fade-in duration-150">
          {loading && !profile ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
            </div>
          ) : profile ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-foreground-muted">
                      person
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    href={`/users/${profile.username}`}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {profile.displayName ?? profile.username}
                  </Link>
                  <p className="text-[11px] text-foreground-muted">
                    {formatCount(profile.followerCount)} followers
                  </p>
                </div>
              </div>

              {/* Follow button */}
              <button className="w-full py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wide transition-colors mb-3">
                Follow
              </button>

              {/* Recent images grid */}
              {profile.recentImages.length > 0 && (
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                  {profile.recentImages.map((path, i) => (
                    <div key={i} className="aspect-square bg-surface-secondary dark:bg-[#2a2a2a]">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`}
                        alt=""
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
