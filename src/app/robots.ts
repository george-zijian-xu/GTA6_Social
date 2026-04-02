import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/auth/", "/notifications", "/profile", "/publish", "/search", "/privacy", "/dmca", "/locations", "/_next/"],
      },
    ],
    sitemap: "https://gta-social.com/sitemap.xml",
  };
}
