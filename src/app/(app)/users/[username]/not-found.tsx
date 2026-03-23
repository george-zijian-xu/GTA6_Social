import Link from "next/link";

export default function UserNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
      <span className="material-symbols-outlined text-[64px] text-foreground-muted mb-4">
        person_off
      </span>
      <h1 className="text-2xl font-bold text-foreground mb-2">User not found</h1>
      <p className="text-foreground-muted text-sm mb-6">
        This account may have been removed or the username is incorrect.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors"
      >
        Back to Discover
      </Link>
    </div>
  );
}
