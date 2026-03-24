"use client";

import { useState } from "react";
import Image from "next/image";
import type { PostImage } from "@/lib/post";

interface ImageGalleryProps {
  images: PostImage[];
  caption: string;
}

export function ImageGallery({ images, caption }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center rounded-2xl">
        <span className="material-symbols-outlined text-[48px] text-foreground-muted">
          image
        </span>
      </div>
    );
  }

  const current = images[index];
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${current.storagePath}`;
  const multi = images.length > 1;
  const aspectRatio = current.width && current.height
    ? `${current.width} / ${current.height}`
    : "4 / 3";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black group">
      {/* Aspect-ratio container caps height at 80vh; fill image renders at full res */}
      <div className="relative w-full max-h-[80vh]" style={{ aspectRatio }}>
        <Image
          src={imageUrl}
          alt={current.altText ?? caption.slice(0, 80)}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority={index === 0}
        />
      </div>

      {/* Navigation arrows */}
      {multi && (
        <>
          {index > 0 && (
            <button
              onClick={() => setIndex((i) => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>
          )}
          {index < images.length - 1 && (
            <button
              onClick={() => setIndex((i) => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          )}
        </>
      )}

      {/* Dot indicators */}
      {multi && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index
                  ? "bg-white scale-110"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
