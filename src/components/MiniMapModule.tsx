import Link from "next/link";

interface MiniMapModuleProps {
  locationName: string | null;
  locationSlug: string | null;
}

export function MiniMapModule({ locationName, locationSlug }: MiniMapModuleProps) {
  if (!locationName || !locationSlug) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-surface-secondary dark:bg-[#2a2a2a] h-24 flex items-center justify-center group">
      {/* Grayscale map placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 opacity-50 group-hover:opacity-30 transition-opacity" />

      {/* Location label */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <p className="text-[0.65rem] text-foreground-muted uppercase tracking-widest font-bold">
          {locationName}
        </p>
        <Link
          href={`/map?focus=${locationSlug}`}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm text-xs font-bold text-foreground hover:bg-white dark:hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">
            location_on
          </span>
          OPEN MAP
        </Link>
      </div>
    </div>
  );
}
