"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function PostDetailLeft({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div
      className="lg:w-[60%] shrink-0 bg-surface-base flex items-center justify-center p-4 lg:p-8 relative cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) router.push("/");
      }}
    >
      {children}
    </div>
  );
}
