"use client";

import { PostForm } from "./PostForm";

interface FastPostPanelProps {
  open: boolean;
  onClose: () => void;
}

export function FastPostPanel({ open, onClose }: FastPostPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 md:left-64 h-full w-full md:w-[420px] bg-surface-card dark:bg-[#1e1e1e] z-40 flex flex-col border-l border-foreground/5 shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.05)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-28 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">Publish Content</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl text-foreground-muted">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <PostForm onClose={onClose} compact />
      </aside>
    </>
  );
}
