import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLocationBySlug } from "@/lib/locations";
import { UserPostGrid } from "@/components/UserPostGrid";
import { mapFeedRow, type FeedPost } from "@/lib/feed";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const location = await getLocationBySlug(slug, supabase);

  if (!location) return { title: "Location not found" };

  const canonicalUrl = `https://grandtheftauto6.com/locations/${slug}`;

  return {
    title: `Posts from ${location.name}`,
    description: `Explore ${location.postCount} posts tagged at ${location.name} on Leonida Social.`,
    alternates: { canonical: canonicalUrl },
    openGraph: { url: canonicalUrl, type: "website" },
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const location = await getLocationBySlug(slug, supabase);

  if (!location) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: postsRaw } = await supabase.rpc("get_feed", {
    p_viewer_id: user?.id ?? null,
    p_limit: 40,
  });
  const posts: FeedPost[] = (postsRaw ?? [])
    .filter((p: { location_slug: string }) => p.location_slug === slug)
    .map(mapFeedRow);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: location.name,
    url: `https://grandtheftauto6.com/locations/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{location.name}</h1>
          <p className="text-sm text-foreground-muted mt-1">
            {location.postCount} {location.postCount === 1 ? "post" : "posts"}
            {location.category ? ` · ${location.category}` : ""}
          </p>
        </div>
        <UserPostGrid posts={posts} />
      </div>
    </>
  );
}
