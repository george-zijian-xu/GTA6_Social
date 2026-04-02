"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenuDrawer({ open, onClose }: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  // Close on route change
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 z-[70] w-64 bg-surface-card dark:bg-[#111111] flex flex-col shadow-2xl md:hidden animate-in slide-in-from-left duration-200">
        <div className="px-6 pt-8 pb-6 border-b border-foreground/5">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary" onClick={onClose}>
            GTA Social
          </Link>
        </div>

        <div className="flex-1 px-6 py-6 space-y-5">
          <Link
            href="/about"
            className="flex items-center gap-3 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
            About
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-3 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">policy</span>
            Privacy
          </Link>
          <Link
            href="/dmca"
            className="flex items-center gap-3 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">copyright</span>
            DMCA
          </Link>
          <button
            onClick={toggle}
            className="flex items-center gap-3 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="px-6 pb-8 border-t border-foreground/5 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
