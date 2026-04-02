"use client";

import { useState, useRef, useEffect } from "react";

export function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discordHint, setDiscordHint] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }

  function shareToX() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?url=${url}`, "_blank");
    setOpen(false);
  }

  function shareToReddit() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://reddit.com/submit?url=${url}`, "_blank");
    setOpen(false);
  }

  async function shareToDiscord() {
    await navigator.clipboard.writeText(window.location.href);
    setDiscordHint(true);
    setTimeout(() => {
      setDiscordHint(false);
      setOpen(false);
    }, 2500);
  }

  function shareToTelegram() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}`, "_blank");
    setOpen(false);
  }

  return (
    <div className="relative ml-auto" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-foreground-muted hover:text-foreground transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">share</span>
        <span className="text-sm font-medium">Share</span>
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-56 bg-surface-secondary rounded-xl shadow-lg border border-border overflow-hidden z-50">
          <button
            onClick={copyLink}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-tertiary transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[18px]">link</span>
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            onClick={shareToX}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-tertiary transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Share to X
          </button>
          <button
            onClick={shareToReddit}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-tertiary transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
            Share to Reddit
          </button>
          <button
            onClick={shareToDiscord}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-tertiary transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span className="flex flex-col">
              <span>Share to Discord</span>
              {discordHint && (
                <span className="text-xs text-foreground-muted leading-tight">
                  Link copied — paste it in Discord
                </span>
              )}
            </span>
          </button>
          <button
            onClick={shareToTelegram}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-tertiary transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            Share to Telegram
          </button>
        </div>
      )}
    </div>
  );
}
