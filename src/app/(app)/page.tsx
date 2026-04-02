import { fetchFeedPage } from "@/lib/feed-server";
import { createClient } from "@/lib/supabase/server";
import { MasonryFeed } from "@/components/MasonryFeed";
import { SearchBar } from "@/components/SearchBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "GTA Social | The Ultimate GTA 6 Roleplay & Community",
  },
  description: "Join GTA Social, the ultimate GTA 6 roleplay community! Post as a Leonida local, share NPC moments, and pin your stories to our interactive Vice City map.",
  alternates: { canonical: "https://gta-social.com" },
  openGraph: {
    title: "GTA Social | The Ultimate GTA 6 Roleplay & Community",
    description: "Join GTA Social, the ultimate GTA 6 roleplay community! Post as a Leonida local, share NPC moments, and pin your stories to our interactive Vice City map.",
    url: "https://gta-social.com",
    type: "website",
  },
};

export default async function Home({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const [{ posts, nextCursor }, { data: { user } }] = await Promise.all([
    fetchFeedPage(undefined, params.location),
    supabase.auth.getUser(),
  ]);

  return (
    <div>
      {/* Search header — matches Stitch h-28 */}
      <header className="h-28 flex items-center px-4 md:px-10">
        <div className="w-full max-w-2xl">
          <h1 className="sr-only">Welcome to GTA Social: The Leonida Community Feed</h1>
          <SearchBar />
        </div>
      </header>

      {/* Content */}
      <div className="px-4 md:px-10 pb-20 md:pb-12">
        <div className="flex border-b border-foreground/5 mb-8 -mt-px">
          <h2 className="sr-only">Discover Trending GTA 6 Community Posts</h2>
          <button className="pb-3 border-b-2 border-primary text-primary font-bold text-sm tracking-wide">
            Recommendations
          </button>
        </div>

        <MasonryFeed initialPosts={posts} initialCursor={nextCursor} userId={user?.id ?? null} />
      </div>
    </div>
  );
}
