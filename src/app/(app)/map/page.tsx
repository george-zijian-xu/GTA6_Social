import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAllLocations } from "@/lib/locations";
import { MapClient } from "./MapClient";

export const metadata = {
  title: "Location Explorer — Leonida Social",
  description: "Explore locations in Leonida and discover posts from each area.",
};

interface Props {
  searchParams: Promise<{ focus?: string }>;
}

export default async function MapPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const locations = await getAllLocations(supabase);

  return (
    <div className="fixed inset-0 md:left-64 z-30">
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
