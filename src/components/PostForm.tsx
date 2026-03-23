"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createPost } from "@/lib/publish";
import { containsProfanity } from "@/lib/profanity";

interface ImagePreview {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface PostFormProps {
  onClose?: () => void;
  compact?: boolean;
}

export function PostForm({ onClose, compact = false }: PostFormProps) {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [showLocations, setShowLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const MAX_IMAGES = 10;
  const MAX_CAPTION = 2000;

  // Load image dimensions
  function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).slice(0, MAX_IMAGES - images.length);
    const newPreviews: ImagePreview[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) continue;
      const dims = await loadImageDimensions(file);
      newPreviews.push({
        file,
        url: URL.createObjectURL(file),
        width: dims.width,
        height: dims.height,
      });
    }

    setImages((prev) => [...prev, ...newPreviews].slice(0, MAX_IMAGES));
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [images.length]);

  // Location search
  async function searchLocations(query: string) {
    setLocationSearch(query);
    if (!query.trim()) {
      setLocations([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("locations")
      .select("id, name")
      .ilike("name", `%${query}%`)
      .limit(10);
    setLocations(data ?? []);
  }

  async function handleSubmit() {
    const trimmed = caption.trim();
    if (!trimmed) {
      setError("Caption is required.");
      return;
    }
    if (containsProfanity(trimmed)) {
      setError("Your caption contains inappropriate language. Please revise.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Upload images to Supabase Storage (if authenticated)
      const uploadedImages: { storagePath: string; width: number; height: number }[] = [];
      if (user && images.length > 0) {
        for (const img of images) {
          const ext = img.file.name.split(".").pop() || "jpg";
          const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("post-images")
            .upload(path, img.file);
          if (uploadErr) throw uploadErr;
          uploadedImages.push({ storagePath: path, width: img.width, height: img.height });
        }
      }

      // Auth check — only redirect AFTER user has committed to publishing
      if (!user) {
        setError("Please log in to publish.");
        setSubmitting(false);
        setTimeout(() => router.push("/auth/login"), 1500);
        return;
      }

      const result = await createPost({
        authorId: user.id,
        caption: trimmed,
        locationId: locationId ?? undefined,
        images: uploadedImages,
        client: supabase,
      });

      if (!result) {
        setError("Your caption contains inappropriate language. Please revise.");
        setSubmitting(false);
        return;
      }

      if (onClose) onClose();
      router.push(`/posts/${result.slug}`);
      router.refresh();
    } catch (err) {
      setError(`Failed to publish. ${err instanceof Error ? err.message : "Please try again."}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-8 no-scrollbar">
        {/* Media upload */}
        <div className="space-y-4">
          <label className="block text-[0.65rem] font-bold text-foreground-muted uppercase tracking-widest">
            Media
          </label>
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image src={img.url} alt="" fill className="object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-foreground/10 flex items-center justify-center hover:border-primary/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[24px] text-foreground-muted">add</span>
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`relative ${compact ? "aspect-[3/2]" : "aspect-video"} w-full rounded-2xl border-2 border-dashed border-foreground/10 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer bg-surface-secondary/50 dark:bg-white/[0.02]`}
            >
              <span className="material-symbols-outlined text-[32px] text-foreground-muted mb-2">
                cloud_upload
              </span>
              <span className="text-xs text-foreground-muted font-medium">
                Drop images or click to upload
              </span>
              <span className="text-[10px] text-foreground-muted mt-1">
                Up to {MAX_IMAGES} images
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {/* Caption */}
        <div className="space-y-3">
          <label className="block text-[0.65rem] font-bold text-foreground-muted uppercase tracking-widest">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
            placeholder="What's happening in Leonida?"
            rows={compact ? 4 : 6}
            className="w-full bg-transparent border-none p-0 text-sm leading-relaxed placeholder:text-foreground-muted focus:ring-0 focus:outline-none resize-none text-foreground"
          />
          <div className="flex items-center justify-between">
            <div className="h-px flex-1 bg-foreground/5" />
            <span className="text-[10px] text-foreground-muted ml-2">
              {caption.length}/{MAX_CAPTION}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3 pt-4 border-t border-foreground/5">
          <div className="relative">
            <div
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setShowLocations(!showLocations)}
            >
              <div className="flex items-center text-foreground-muted">
                <span className="material-symbols-outlined text-xl mr-3">location_on</span>
                <span className="text-sm font-medium">
                  {locationId ? locations.find((l) => l.id === locationId)?.name ?? locationSearch : "Location (optional)"}
                </span>
              </div>
              <span className="material-symbols-outlined text-foreground-muted text-lg group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>

            {showLocations && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => searchLocations(e.target.value)}
                  placeholder="Search locations..."
                  className="w-full rounded-lg bg-surface-secondary dark:bg-[#2a2a2a] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {locations.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-lg bg-surface-card dark:bg-[#1e1e1e] border border-foreground/5">
                    {locations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setLocationId(loc.id);
                          setLocationSearch(loc.name);
                          setShowLocations(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-surface-secondary dark:hover:bg-white/5 transition-colors"
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                )}
                {locationId && (
                  <button
                    onClick={() => { setLocationId(null); setLocationSearch(""); setShowLocations(false); }}
                    className="text-xs text-primary"
                  >
                    Clear location
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error + Submit */}
      <div className="p-8 pt-0">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting || !caption.trim()}
          className="w-full bg-primary text-white rounded-2xl py-4 text-sm font-bold tracking-wide shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? "Publishing..." : "Publish Now"}
        </button>
      </div>
    </div>
  );
}
