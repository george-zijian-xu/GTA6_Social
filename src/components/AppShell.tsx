"use client";

import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ThemeProvider } from "./ThemeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Sidebar />
      <main className="md:ml-64 min-h-screen pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </ThemeProvider>
  );
}
