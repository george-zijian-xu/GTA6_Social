"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-foreground-muted hover:text-foreground transition-colors ml-auto"
    >
      <span className="material-symbols-outlined text-[20px]">
        {copied ? "check" : "share"}
      </span>
      <span className="text-sm font-medium">
        {copied ? "Copied" : "Share"}
      </span>
    </button>
  );
}
