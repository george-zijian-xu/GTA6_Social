"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { ThemeProvider } from "./ThemeProvider";
import { FastPostPanel } from "./FastPostPanel";
import { createClient } from "@/lib/supabase/client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <ThemeProvider>
      <Sidebar onPostClick={() => setPanelOpen(true)} />
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 bg-surface-card/80 dark:bg-[#111111]/80 backdrop-blur-xl border-b border-foreground/5">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-secondary dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <span className="flex-1 text-center text-base font-bold tracking-tight text-primary">GTA Social</span>
        {/* Spacer to balance the hamburger */}
        <div className="w-9" />
      </div>
      <main className="md:ml-64 min-h-screen pt-14 md:pt-0 pb-16 md:pb-0">{children}</main>
      <MobileNav />
      <MobileMenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <FastPostPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </ThemeProvider>
  );
}
