import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/profile";
import { isFollowing } from "@/lib/follows";
import { formatCount } from "@/lib/format";
import { UserPostGrid } from "@/components/UserPostGrid";
import { ProfileActions } from "./ProfileActions";
import { mapFeedRow, type FeedPost } from "@/lib/feed";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const profile = await getUserProfile(username, supabase);

  if (!profile) return { title: "User not found" };

  const canonicalUrl = `https://gta-social.com/users/${username}`;
  const displayName = profile.displayName ?? profile.username;
  const description = `Explore ${displayName}'s GTA 6 roleplay profile on GTA Social. Check out their latest posts, photos, and adventures across Vice City and Leonida.`.slice(0, 160);

  return {
    title: `${displayName} (@${profile.username})`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      url: canonicalUrl,
      type: "profile",
      firstName: displayName,
      username: profile.username,
      description,
    },
    twitter: { card: "summary" },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  const profile = await getUserProfile(username, supabase);

  if (!profile) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;
  const following = user && !isOwnProfile
    ? await isFollowing(user.id, profile.id, supabase)
    : false;

  // Fetch user's posts for the grid
  const { data: postsRaw } = await supabase.rpc("get_feed", {
    p_viewer_id: user?.id ?? null,
    p_limit: 40,
  });
  const userPosts: FeedPost[] = (postsRaw ?? [])
    .filter((p: { author_id: string }) => p.author_id === profile.id)
    .map(mapFeedRow);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName ?? profile.username,
    url: `https://gta-social.com/users/${profile.username}`,
    description: profile.bio ?? undefined,
    image: profile.avatarUrl ?? undefined,
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/FollowAction", userInteractionCount: profile.followerCount },
    ],
  };

  const breakpointColumns = { default: 3, 1024: 3, 640: 2, 0: 1 };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-20 md:pb-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-surface-secondary dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName ?? profile.username}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-[40px] text-foreground-muted">
              person
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {profile.displayName ?? profile.username}
            </h1>
            <ProfileActions
              isOwnProfile={isOwnProfile}
              profile={profile}
              currentUserId={user?.id ?? null}
              following={following}
            />
          </div>

          <p className="text-sm text-foreground-muted mb-3">@{profile.username}</p>

          {profile.bio && (
            <p className="text-sm text-foreground mb-2">{profile.bio}</p>
          )}

          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-4 md:gap-6 mt-4">
            <div className="text-center">
              <span className="text-lg font-bold text-foreground">{formatCount(profile.followerCount)}</span>
              <span className="text-xs text-foreground-muted ml-1">Followers</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-foreground">{formatCount(profile.followingCount)}</span>
              <span className="text-xs text-foreground-muted ml-1">Following</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-foreground">{formatCount(profile.totalLikes)}</span>
              <span className="text-xs text-foreground-muted ml-1">Likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post grid */}
      <h2 className="sr-only">Latest Posts from {profile.displayName ?? profile.username}</h2>
      <UserPostGrid posts={userPosts} userId={user?.id ?? null} />
    </div>
    </>
  );
}
