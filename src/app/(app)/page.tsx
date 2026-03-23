import { fetchFeedPage } from "@/lib/feed-server";
import { MasonryFeed } from "@/components/MasonryFeed";
import { SearchBar } from "@/components/SearchBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover",
  description: "Discover posts from citizens of Leonida. The unofficial GTA 6 fan social network.",
  alternates: { canonical: "https://grandtheftauto6.com" },
};

export default async function Home() {
  const { posts, nextCursor } = await fetchFeedPage();

  return (
    <div className="px-4 md:px-10 pt-6 pb-20 md:pb-12">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Tab header */}
      <div className="flex border-b border-foreground/5 mb-8 mt-1.5">
        <button className="pb-3 border-b-2 border-primary text-primary font-bold text-sm tracking-wide">
          Recommendations
        </button>
      </div>

      <MasonryFeed initialPosts={posts} initialCursor={nextCursor} />
    </div>
  );
}
