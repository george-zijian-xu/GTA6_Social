export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface-base">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">
          Leonida Social
        </h1>
        <p className="text-lg text-foreground-muted max-w-md">
          Unofficial GTA6 Fan Page — Coming Soon
        </p>
        <div className="flex items-center gap-2 text-foreground-muted">
          <span className="material-symbols-outlined text-primary">
            explore
          </span>
          <span className="text-sm">
            A parody social network for the citizens of Leonida
          </span>
        </div>
      </main>
    </div>
  );
}
