"use client";

import { PostForm } from "@/components/PostForm";

export default function PublishPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="px-8 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Publish</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Share something with the citizens of Leonida.
        </p>
      </div>
      <PostForm />
    </div>
  );
}
