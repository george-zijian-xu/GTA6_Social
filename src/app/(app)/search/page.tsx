import { createClient } from "@/lib/supabase/server";
import { search } from "@/lib/search";
import { SearchResults } from "./SearchResults";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const results = query
    ? await search(query, supabase, user?.id)
    : { posts: [], users: [] };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <SearchResults initialQuery={query} initialResults={results} userId={user?.id ?? null} />
    </div>
  );
}
