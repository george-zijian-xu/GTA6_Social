"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Discover", icon: "explore" },
  { href: "/publish", label: "Publish", icon: "add_box" },
  { href: "/profile", label: "Profile", icon: "person_outline" },
  { href: "/notifications", label: "Notifications", icon: "notifications_none" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("target_user_id", data.user.id)
          .is("read_at", null)
          .then(({ count }) => setUnreadCount(count ?? 0));
      }
    });
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-card/80 dark:bg-[#111111]/80 backdrop-blur-xl border-t border-foreground/5">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                active
                  ? "text-primary"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <span className="material-symbols-outlined text-[22px] relative">
                {item.icon}
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
