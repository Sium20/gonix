"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { hidePost, publishPost, deletePost } from "./actions";

export function PostActions({ postId, slug, status, isAdmin }: { postId: string; slug: string; status: string; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggleVisibility() {
    startTransition(async () => {
      const fn = status === "published" ? hidePost : publishPost;
      const r = await fn(postId);
      if (r?.error) toast.error(r.error);
      else {
        toast.success(status === "published" ? "Post hidden" : "Post published");
        router.refresh();
      }
    });
  }

  function onDelete() {
    startTransition(async () => {
      const r = await deletePost(postId);
      if (r?.error) toast.error(r.error);
      else {
        toast.success("Post deleted");
        router.push("/dashboard/posts");
      }
    });
  }

  return (
    <div className="space-y-3">
      {confirmDelete ? (
        <div className="rounded-md border border-danger/30 bg-danger/[0.05] p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Delete this post permanently?</p>
            <p className="text-xs text-fg-muted mt-1">This cannot be undone.</p>
            <div className="flex gap-2 mt-3">
              <Button variant="danger" size="sm" onClick={onDelete} loading={pending}>
                <Trash2 className="h-3.5 w-3.5" /> Yes, delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={toggleVisibility} loading={pending}>
            {status === "published" ? (
              <><EyeOff className="h-3.5 w-3.5" /> {isAdmin ? "Hide post" : "Unpublish"}</>
            ) : (
              <><Eye className="h-3.5 w-3.5" /> Publish</>
            )}
          </Button>
          {!isAdmin ? (
            <a href={`/dashboard/posts/${postId}/edit`}>
              <Button variant="outline" size="sm">Edit</Button>
            </a>
          ) : null}
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}
