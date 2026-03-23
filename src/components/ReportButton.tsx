"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitReport } from "@/lib/admin";

interface ReportButtonProps {
  postId?: string;
  commentId?: string;
}

export function ReportButton({ postId, commentId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (!reason.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    await submitReport({
      reporterId: user.id,
      postId,
      commentId,
      reason: reason.trim(),
      client: supabase,
    });

    setDone(true);
    setSubmitting(false);
    setTimeout(() => { setOpen(false); setDone(false); setReason(""); }, 1500);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-foreground-muted hover:text-primary transition-colors text-xs"
        title="Report"
      >
        <span className="material-symbols-outlined text-[16px]">flag</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-surface-card dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-foreground mb-4">Report Content</h2>

            {done ? (
              <p className="text-sm text-green-600 dark:text-green-400 text-center py-4">
                Report submitted. Thank you.
              </p>
            ) : (
              <>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={4}
                  className="w-full rounded-lg bg-surface-secondary dark:bg-[#2a2a2a] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2 rounded-full bg-surface-secondary dark:bg-white/10 text-sm font-semibold text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !reason.trim()}
                    className="flex-1 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
