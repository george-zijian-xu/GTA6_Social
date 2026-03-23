import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPostBySlug, getComments } from "@/lib/post";
import { formatCount } from "@/lib/format";
import { ImageGallery } from "@/components/ImageGallery";
import { MiniMapModule } from "@/components/MiniMapModule";
import { CommentList } from "@/components/CommentList";
import { ProfileHoverCard } from "@/components/ProfileHoverCard";
import { ShareButton } from "./ShareButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const post = await getPostBySlug(slug, supabase);

  if (!post) return { title: "Post not found" };

  const imageUrl = post.images[0]
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.images[0].storagePath}`
    : undefined;

  return {
    title: `${post.caption.slice(0, 60) || "Post"} — Leonida Social`,
    description: post.caption.slice(0, 160) || `Post by ${post.username} on Leonida Social`,
    openGraph: {
      title: post.caption.slice(0, 60) || "Post on Leonida Social",
      description: post.caption.slice(0, 160),
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const post = await getPostBySlug(slug, supabase);

  if (!post) notFound();

  const comments = await getComments(post.id, "recent", supabase);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left: Image Gallery (60%) */}
      <div className="lg:w-[60%] flex-shrink-0 bg-black flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-2xl">
          <ImageGallery images={post.images} caption={post.caption} />
        </div>
      </div>

      {/* Right: Post Info (40%) */}
      <div className="lg:w-[40%] flex flex-col bg-surface-card dark:bg-[#1e1e1e] border-l border-foreground/5">
        {/* User header */}
        <div className="p-6 border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <ProfileHoverCard username={post.username}>
              <Link href={`/users/${post.username}`}>
                <div className="w-12 h-12 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-foreground-muted">
                    person
                  </span>
                </div>
              </Link>
            </ProfileHoverCard>
            <div className="min-w-0">
              <ProfileHoverCard username={post.username}>
                <Link
                  href={`/users/${post.username}`}
                  className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                >
                  {post.displayName ?? post.username}
                </Link>
              </ProfileHoverCard>
              <div className="flex items-center gap-2 text-[11px] text-foreground-muted">
                <span>{timeAgo(post.createdAt)}</span>
                {post.locationName && (
                  <>
                    <span>·</span>
                    <Link
                      href={`/locations/${post.locationSlug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.locationName}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div className="px-6 py-4">
          <p className="text-lg font-semibold leading-relaxed text-foreground">
            {post.caption}
          </p>
        </div>

        {/* Mini map module */}
        <div className="px-6 pb-4">
          <MiniMapModule
            locationName={post.locationName}
            locationSlug={post.locationSlug}
          />
        </div>

        {/* Comments section */}
        <div className="flex-1 px-6 pb-4 min-h-0 flex flex-col">
          <CommentList initialComments={comments} postId={post.id} />
        </div>

        {/* Comment input (visual only) */}
        <div className="px-6 py-3 border-t border-foreground/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[14px] text-foreground-muted">
                person
              </span>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Add a comment..."
                disabled
                className="w-full rounded-xl bg-surface-secondary dark:bg-[#2a2a2a] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="px-6 py-3 border-t border-foreground/5 flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-foreground-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              favorite
            </span>
            <span className="text-sm font-medium">
              {formatCount(post.likeCount)}
            </span>
          </button>
          <button className="flex items-center gap-1.5 text-foreground-muted">
            <span className="material-symbols-outlined text-[20px]">
              chat_bubble_outline
            </span>
            <span className="text-sm font-medium">
              {formatCount(post.commentCount)}
            </span>
          </button>
          <ShareButton />
        </div>
      </div>
    </div>
  );
}
