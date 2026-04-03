import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const BASE_URL = "https://gta-social.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GTA Social — Unofficial GTA6 Fan Page",
    template: "%s | GTA Social",
  },
  description:
    "A parody social network inspired by GTA 6. Roleplay as NPCs, share posts, and explore Leonida.",
  openGraph: {
    type: "website",
    siteName: "GTA Social",
    locale: "en_US",
    title: "GTA Social — Unofficial GTA6 Fan Page",
    description:
      "A parody social network inspired by GTA 6. Roleplay as NPCs, share posts, and explore Leonida.",
    url: BASE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GTA Social — Unofficial GTA6 Fan Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GtaSocial",
    title: "GTA Social — Unofficial GTA6 Fan Page",
    description:
      "A parody social network inspired by GTA 6. Roleplay as NPCs, share posts, and explore Leonida.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  other: {
    "ahrefs-site-verification": "55cb8b3f62d97ae2ddee522baeb9720aa0cd3b26b28e0168cd8ebb21d7a67283",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "96x96", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
