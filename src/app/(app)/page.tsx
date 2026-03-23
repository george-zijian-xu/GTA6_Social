import { fetchFeedPage } from "@/lib/feed-server";
import { createClient } from "@/lib/supabase/server";
import { MasonryFeed } from "@/components/MasonryFeed";
import { SearchBar } from "@/components/SearchBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover",
  description: "Discover posts from citizens of Leonida. The unofficial GTA 6 fan social network.",
  alternates: { canonical: "https://grandtheftauto6.com" },
};

export default async function Home() {
  const supabase = await createClient();
  const [{ posts, nextCursor }, { data: { user } }] = await Promise.all([
    fetchFeedPage(),
    supabase.auth.getUser(),
  ]);

  return (
    <div>
      {/* Search header — matches Stitch h-28 */}
      <header className="h-28 flex items-center px-4 md:px-10">
        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>
      </header>

      {/* Content */}
      <div className="px-4 md:px-10 pb-20 md:pb-12">
        {/* Tab header — flush to top of content, border aligns with sidebar nav items */}
        <div className="flex border-b border-foreground/5 mb-8 -mt-px">
          <button className="pb-3 border-b-2 border-primary text-primary font-bold text-sm tracking-wide">
            Recommendations
          </button>
        </div>

        <MasonryFeed initialPosts={posts} initialCursor={nextCursor} userId={user?.id ?? null} />
      </div>
    </div>
  );
}
