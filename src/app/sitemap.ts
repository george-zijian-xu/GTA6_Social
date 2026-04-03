import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gta-social.com").trim();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch all public slugs
  const [{ data: posts }, { data: users }, { data: locations }] = await Promise.all([
    supabase.from("posts").select("slug, created_at").order("created_at", { ascending: false }).limit(1000),
    supabase.from("profiles").select("id, username, created_at").not("username", "is", null).limit(1000),
    supabase.from("locations").select("slug, created_at").gt("post_count", 0).limit(500),
  ]);

  // Filter out profiles that have no posts (test/ghost accounts)
  const { data: activeAuthorIds } = await supabase
    .from("posts")
    .select("author_id")
    .limit(5000);
  const authorSet = new Set((activeAuthorIds ?? []).map((p) => p.author_id));

  const postUrls: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE_URL}/posts/${p.slug}`,
    lastModified: p.created_at,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const userUrls: MetadataRoute.Sitemap = (users ?? [])
    .filter((u) => authorSet.has(u.id))
    .map((u) => ({
      url: `${BASE_URL}/users/${u.username}`,
      lastModified: u.created_at,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const locationUrls: MetadataRoute.Sitemap = (locations ?? []).map((l) => ({
    url: `${BASE_URL}/locations/${l.slug}`,
    lastModified: l.created_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    { url: BASE_URL, changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE_URL}/map`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/dmca`, changeFrequency: "yearly", priority: 0.1 },
    ...postUrls,
    ...userUrls,
    ...locationUrls,
  ];
}
