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
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Mobile: bottom sheet | Desktop: side panel from sidebar edge */}
      <aside className="fixed z-50 bg-surface-card dark:bg-[#1e1e1e] flex flex-col border-foreground/5
        /* Mobile: bottom sheet */
        bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh]
        /* Desktop: side panel */
        md:top-0 md:bottom-auto md:left-64 md:right-auto md:h-full md:w-[420px] md:rounded-none md:border-l
        shadow-lg md:shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.05)]"
      >
        {/* Handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 md:h-28 flex-shrink-0">
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
