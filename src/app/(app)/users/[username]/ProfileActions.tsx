"use client";

import { useState } from "react";
import { FollowButton } from "@/components/FollowButton";
import { EditProfileModal } from "@/components/EditProfileModal";
import type { UserProfile } from "@/lib/profile";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  profile: UserProfile;
  currentUserId: string | null;
  following: boolean;
}

export function ProfileActions({
  isOwnProfile,
  profile,
  currentUserId,
  following,
}: ProfileActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      {isOwnProfile ? (
        <button
          onClick={() => setEditOpen(true)}
          className="px-4 py-2 rounded-full bg-surface-secondary dark:bg-white/10 text-sm font-semibold text-foreground hover:bg-surface-secondary/80 transition-colors"
        >
          Edit Profile
        </button>
      ) : (
        <FollowButton
          targetUserId={profile.id}
          currentUserId={currentUserId}
          initialFollowing={following}
          initialCount={profile.followerCount}
        />
      )}

      <button
        onClick={handleShare}
        className="p-2 rounded-full hover:bg-surface-secondary dark:hover:bg-white/5 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px] text-foreground-muted">
          {copied ? "check" : "share"}
        </span>
      </button>

      {isOwnProfile && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={profile}
        />
      )}
    </div>
  );
}
