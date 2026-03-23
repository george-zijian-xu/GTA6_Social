"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ThemeProvider } from "./ThemeProvider";
import { FastPostPanel } from "./FastPostPanel";
import { createClient } from "@/lib/supabase/client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // Sync server session with browser client on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <ThemeProvider>
      <Sidebar onPostClick={() => setPanelOpen(true)} />
      <main className="md:ml-64 min-h-screen pb-16 md:pb-0">{children}</main>
      <MobileNav />
      <FastPostPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </ThemeProvider>
  );
}
