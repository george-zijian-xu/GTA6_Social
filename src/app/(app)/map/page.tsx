import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAllLocations } from "@/lib/locations";
import { MapClient } from "./MapClient";

export const metadata = {
  title: {
    absolute: "GTA 6 Interactive Map | Explore Leonida & Vice City",
  },
  description: "Explore the definitive GTA 6 interactive map on GTA Social. Discover real-time player pins, Vice City hotspots, and hidden Leonida locations.",
  alternates: { canonical: "https://gta-social.com/map" },
};

interface Props {
  searchParams: Promise<{ focus?: string }>;
}

export default async function MapPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const locations = await getAllLocations(supabase);

  return (
    <div className="fixed inset-0 left-0 md:left-64 bottom-14 md:bottom-0 z-30">
      <h1 className="sr-only">GTA 6 Interactive Map: Discover Leonida & Vice City</h1>
      <h2 className="sr-only">Discover Pinned Locations & Community Posts</h2>
      <h2 className="sr-only">Popular Spots in Leonida</h2>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-surface-base dark:bg-[#0a0a0a]">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
        </div>
      }>
        <MapClient locations={locations} focusSlug={params.focus} />
      </Suspense>
    </div>
  );
}
