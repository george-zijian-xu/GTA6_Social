import Link from "next/link";
import Image from "next/image";
import type { FeedPost } from "@/lib/feed";
import { LikeButton } from "@/components/LikeButton";

interface PostCardProps {
  post: FeedPost;
  priority?: boolean;
  userId?: string | null;
}

export function PostCard({ post, priority = false, userId = null }: PostCardProps) {
  const imageUrl = post.imagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.imagePath}`
    : null;

  return (
    <article className="bg-surface-card dark:bg-[#1e1e1e] rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Image */}
      <Link href={`/posts/${post.slug}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.imageAlt ?? post.caption.slice(0, 80)}
            width={post.imageWidth ?? 400}
            height={post.imageHeight ?? 300}
            className="aspect-[4/3] w-full object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="aspect-[4/3] w-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-foreground-muted">
              image
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/posts/${post.slug}`}>
          <h3 className="font-bold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors">
            {(post.title ?? post.caption.split("\n")[0]) || "Untitled"}
          </h3>
        </Link>

        {/* Location tag */}
        {post.locationName && post.locationSlug && (
          <Link
            href={`/locations/${post.locationSlug}`}
            className="mt-1.5 text-[0.65rem] text-foreground-muted hover:text-primary transition-colors truncate"
          >
            <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">
              location_on
            </span>
            {post.locationName}
          </Link>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <Link
            href={`/users/${post.username}`}
            className="flex items-center gap-1.5 min-w-0"
          >
            {post.avatarUrl ? (
              <Image
                src={post.avatarUrl}
                alt={post.username}
                width={20}
                height={20}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[12px] text-foreground-muted">
                  person
                </span>
              </div>
            )}
            <span className="text-[0.7rem] text-foreground-muted truncate hover:text-foreground transition-colors">
              {post.displayName ?? post.username}
            </span>
          </Link>

          <div className="flex items-center gap-1 flex-shrink-0">
            <LikeButton
              targetId={post.id}
              targetType="post"
              initialCount={post.likeCount}
              initialLiked={post.initialLiked}
              userId={userId}
              iconSize="text-[14px]"
              textSize="text-[0.7rem]"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
