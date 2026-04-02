import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GTA Social",
    short_name: "GTA Social",
    description: "A parody social network inspired by GTA 6.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfdfd",
    theme_color: "#ff2442",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
