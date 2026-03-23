"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: {
    displayName: string | null;
    bio: string | null;
    website: string | null;
    avatarUrl: string | null;
  };
}

export function EditProfileModal({ open, onClose, profile }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let avatarUrl = profile.avatarUrl;

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const path = `avatars/${user.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
      }

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || null,
          bio: bio || null,
          website: website || null,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface-card dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-secondary dark:hover:bg-white/5 rounded-full">
            <span className="material-symbols-outlined text-foreground-muted">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-2">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              className="text-sm text-foreground-muted"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg bg-surface-secondary dark:bg-[#2a2a2a] px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-surface-secondary dark:bg-[#2a2a2a] px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className="w-full rounded-lg bg-surface-secondary dark:bg-[#2a2a2a] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">{error}</div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
