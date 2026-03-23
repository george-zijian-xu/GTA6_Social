"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ThemeProvider } from "./ThemeProvider";
import { FastPostPanel } from "./FastPostPanel";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <ThemeProvider>
      <Sidebar onPostClick={() => setPanelOpen(true)} />
      <main className="md:ml-64 min-h-screen pb-16 md:pb-0">{children}</main>
      <MobileNav />
      <FastPostPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </ThemeProvider>
  );
}
