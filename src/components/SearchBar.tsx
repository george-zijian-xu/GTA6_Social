"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-foreground-muted pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts and people..."
        className="w-full rounded-full bg-surface-secondary dark:bg-[#2a2a2a] pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </form>
  );
}
