import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMapPosts } from "@/lib/map-posts";

export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams.get("location") ?? undefined;
  const supabase = await createClient();
  const result = await getMapPosts(location, supabase);

  if (result.error) {
    const status = result.error === "location param required" ? 400 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ posts: result.posts });
}
