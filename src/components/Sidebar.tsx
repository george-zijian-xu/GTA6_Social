"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/", label: "Discover", icon: "explore" },
  { href: "/publish", label: "Publish", icon: "add_box" },
  { href: "/profile", label: "Profile", icon: "person_outline" },
  { href: "/notifications", label: "Notifications", icon: "notifications_none" },
];

interface SidebarProps {
  onPostClick?: () => void;
}

export function Sidebar({ onPostClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-surface-card dark:bg-[#111111] z-50">
      {/* Wordmark */}
      <div className="px-6 pt-8 pb-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          Leonida Social
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[0.75rem] text-sm font-medium transition-colors ${
                active
                  ? "bg-red-50 text-primary dark:bg-primary/10"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface-secondary dark:hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* POST button */}
        <div className="pt-4 px-1">
          <button
            onClick={onPostClick}
            className="flex items-center justify-center w-full py-3 rounded-full bg-primary text-white text-sm font-bold tracking-wide shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors"
          >
            POST
          </button>
        </div>
      </nav>

      {/* Bottom links */}
      <div className="mt-auto px-6 pb-8 space-y-4 border-t border-foreground/5 pt-6">
        <Link
          href="/about"
          className="flex items-center gap-3 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">info</span>
          About
        </Link>
        <Link
          href="/privacy"
          className="flex items-center gap-3 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">policy</span>
          Privacy
        </Link>
        <button
          onClick={toggle}
          className="flex items-center gap-3 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors w-full text-left"
        >
          <span className="material-symbols-outlined text-[16px]">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Logout
          </button>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-3 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            Login
          </Link>
        )}
      </div>
    </aside>
  );
}
