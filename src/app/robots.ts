import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/auth/", "/_next/"],
      },
    ],
    sitemap: "https://grandtheftauto6.com/sitemap.xml",
  };
}
