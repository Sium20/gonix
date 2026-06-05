"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createPost, updatePost } from "@/app/blog/[slug]/actions";

const CATEGORIES = ["Research", "Experience", "Tutorial", "Opinion", "Announcement"];
const COVER_COLORS = [
  { value: "amber", label: "Amber" },
  { value: "emerald", label: "Emerald" },
  { value: "rose", label: "Rose" },
  { value: "indigo", label: "Indigo" },
  { value: "violet", label: "Violet" },
  { value: "teal", label: "Teal" },
  { value: "slate", label: "Slate" },
];

export function PostEditor({
  mode,
  postId,
  initial,
}: {
  mode: "create" | "edit";
  postId?: string;
  initial?: { title: string; excerpt: string; body: string; category: string; coverColor: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const defaults = initial || { title: "", excerpt: "", body: "", category: "", coverColor: "slate" };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    if (postId) fd.append("postId", postId);

    startTransition(async () => {
      const r = mode === "create" ? await createPost(null, fd) : await updatePost(null, fd);
      if (r?.error) {
        setError(r.error);
        toast.error(r.error);
      } else if (r?.success) {
        setSuccess(true);
        toast.success(r.success);
        setTimeout(() => {
          if (mode === "create" && r.slug) {
            router.push(`/blog/${r.slug}`);
          } else if (mode === "edit" && r.slug) {
            router.push(`/blog/${r.slug}`);
          } else {
            router.push("/dashboard/posts");
          }
        }, 600);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/5 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-danger mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Title & excerpt</CardTitle>
          <CardDescription>The title appears in the feed. The excerpt shows below it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={defaults.title}
              required
              minLength={5}
              maxLength={200}
              placeholder="e.g. How I went from zero to ICPC regionals in 18 months"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={defaults.excerpt}
              maxLength={300}
              placeholder="A 1-2 sentence summary that hooks the reader. (Optional, max 300 chars)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Body</CardTitle>
          <CardDescription>
            Supports basic markdown: <code className="text-fg">#</code> headings, <code className="text-fg">-</code> bullet lists, <code className="text-fg">&gt;</code> blockquotes, <code className="text-fg">**bold**</code>, <code className="text-fg">*italic*</code>, and bare URLs become links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="body"
            defaultValue={defaults.body}
            required
            minLength={50}
            maxLength={50000}
            placeholder="Start writing…"
            className="min-h-[320px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorize</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              <input type="hidden" name="category" value={defaults.category} id="category-input" />
              {CATEGORIES.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input
                    type="radio"
                    name="category-display"
                    value={c}
                    defaultChecked={defaults.category === c}
                    onChange={(e) => {
                      const el = document.getElementById("category-input") as HTMLInputElement;
                      if (el) el.value = e.target.value;
                    }}
                    className="peer sr-only"
                  />
                  <span className="inline-block px-3 py-1.5 rounded-full text-sm border border-line bg-bg-soft peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent transition-colors">
                    {c}
                  </span>
                </label>
              ))}
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="category-display"
                  value=""
                  defaultChecked={!defaults.category || !CATEGORIES.includes(defaults.category)}
                  onChange={(e) => {
                    const el = document.getElementById("category-input") as HTMLInputElement;
                    if (el) el.value = "";
                  }}
                  className="peer sr-only"
                />
                <span className="inline-block px-3 py-1.5 rounded-full text-sm border border-line bg-bg-soft peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent transition-colors">
                  None
                </span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cover color</Label>
            <div className="flex flex-wrap gap-2">
              <input type="hidden" name="coverColor" value={defaults.coverColor} id="cover-input" />
              {COVER_COLORS.map((c) => (
                <label key={c.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="coverColor-display"
                    value={c.value}
                    defaultChecked={defaults.coverColor === c.value}
                    onChange={(e) => {
                      const el = document.getElementById("cover-input") as HTMLInputElement;
                      if (el) el.value = e.target.value;
                    }}
                    className="peer sr-only"
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-line bg-bg-soft peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent transition-colors">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br from-${c.value}-400 to-${c.value}-600`} />
                    {c.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 sticky bottom-4">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <div className="flex items-center gap-3">
          {success ? <span className="text-xs text-emerald-700 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Saved</span> : null}
          <Button type="submit" loading={pending}>
            {mode === "create" ? "Publish post" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
