import { fetchFeedPage } from "@/lib/feed-server";
import { MasonryFeed } from "@/components/MasonryFeed";
import { SearchBar } from "@/components/SearchBar";

export default async function Home() {
  const { posts, nextCursor } = await fetchFeedPage();

  return (
    <div className="px-6 md:px-10 pt-6 pb-12">
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
