import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getPostBySlug, getComments } from "@/lib/post";
import { hasUserLikedPost } from "@/lib/likes";
import { formatCount } from "@/lib/format";
import { ImageGallery } from "@/components/ImageGallery";
import { MiniMapModule } from "@/components/MiniMapModule";
import { CommentList } from "@/components/CommentList";
import { ProfileHoverCard } from "@/components/ProfileHoverCard";
import { LikeButton } from "@/components/LikeButton";
import { ReportButton } from "@/components/ReportButton";
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

  const canonicalUrl = `https://grandtheftauto6.com/posts/${slug}`;

  return {
    title: post.caption.slice(0, 60) || "Post",
    description: post.caption.slice(0, 155) || `Post by ${post.username} on Leonida Social`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.caption.slice(0, 60) || "Post on Leonida Social",
      description: post.caption.slice(0, 155),
      url: canonicalUrl,
      images: imageUrl ? [{ url: imageUrl, alt: post.caption.slice(0, 80) }] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.caption.slice(0, 60) || "Post on Leonida Social",
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

  const { data: { user } } = await supabase.auth.getUser();
  const [liked, comments, userProfile] = await Promise.all([
    user ? hasUserLikedPost(post.id, user.id, supabase) : Promise.resolve(false),
    getComments(post.id, "recent", supabase),
    user
      ? supabase.from("profiles").select("avatar_url").eq("id", user.id).single().then(r => r.data)
      : Promise.resolve(null),
  ]);

  const canonicalUrl = `https://grandtheftauto6.com/posts/${slug}`;
  const imageUrl = post.images[0]
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.images[0].storagePath}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    url: canonicalUrl,
    headline: post.caption.slice(0, 110),
    description: post.caption.slice(0, 155),
    author: {
      "@type": "Person",
      name: post.displayName ?? post.username,
      url: `https://grandtheftauto6.com/users/${post.username}`,
    },
    datePublished: post.createdAt,
    image: imageUrl,
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.likeCount },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: post.commentCount },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left: Image Gallery (60%) */}
      <div className="lg:w-[60%] flex-shrink-0 bg-black flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-2xl">
          <ImageGallery images={post.images} caption={post.caption} />
        </div>
      </div>

      {/* Right: Post Info (40%) */}
      <div className="lg:w-[40%] flex flex-col bg-surface-card dark:bg-[#1e1e1e] border-l border-foreground/5 pb-14 md:pb-0">
        {/* User header */}
        <div className="p-6 border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <ProfileHoverCard username={post.username}>
              <Link href={`/users/${post.username}`}>
                <div className="w-12 h-12 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {post.avatarUrl ? (
                    <Image
                      src={post.avatarUrl}
                      alt={post.displayName ?? post.username}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-foreground-muted">
                      person
                    </span>
                  )}
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
          {post.title && (
            <h1 className="text-xl font-bold text-foreground mb-2">{post.title}</h1>
          )}
          {post.caption && (
            <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">{post.caption}</p>
          )}
        </div>

        {/* Mini map module */}
        <div className="px-6 pb-4">
          <MiniMapModule
            locationName={post.locationName}
            locationSlug={post.locationSlug}
            igX={post.locationIgX}
            igY={post.locationIgY}
          />
        </div>

        {/* Comments section */}
        <div className="flex-1 px-6 pb-4 min-h-0 flex flex-col">
          <CommentList initialComments={comments} postId={post.id} userId={user?.id ?? null} userAvatarUrl={userProfile?.avatar_url ?? null} />
        </div>

        {/* Action row */}
        <div className="px-6 py-3 border-t border-foreground/5 flex items-center gap-6">
          <LikeButton
            targetId={post.id}
            targetType="post"
            initialCount={post.likeCount}
            initialLiked={liked}
            userId={user?.id ?? null}
          />
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <span className="material-symbols-outlined text-[20px]">
              chat_bubble_outline
            </span>
            <span className="text-sm font-medium">
              {formatCount(post.commentCount)}
            </span>
          </div>
          <ShareButton />
          {user && user.id !== post.authorId && (
            <ReportButton postId={post.id} />
          )}
        </div>
      </div>
    </div>
    </>
  );
}
