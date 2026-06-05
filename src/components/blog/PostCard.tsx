import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate, ROLE_LABELS } from "@/lib/utils";
import { ArrowUpRight, Clock, GraduationCap, Building2 } from "lucide-react";

// Gradient color sets for the cover placeholder (no image uploads in v1)
const COVER_GRADIENTS: Record<string, string> = {
  amber: "from-amber-500/20 via-orange-500/10 to-transparent",
  emerald: "from-emerald-500/20 via-teal-500/10 to-transparent",
  rose: "from-rose-500/20 via-pink-500/10 to-transparent",
  indigo: "from-indigo-500/20 via-blue-500/10 to-transparent",
  violet: "from-violet-500/20 via-purple-500/10 to-transparent",
  teal: "from-teal-500/20 via-cyan-500/10 to-transparent",
  slate: "from-slate-500/20 via-zinc-500/10 to-transparent",
};

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  coverColor: string | null;
  publishedAt: Date | string;
  readingMinutes: number;
  author: {
    id: string;
    handle: string;
    fullName: string;
    role: string;
    designation: string | null;
    avatarUrl: string | null;
    university: { name: string; slug: string };
    department: { name: string } | null;
    batchYear: number | null;
  };
};

export function PostCard({ post, featured = false }: { post: PostListItem; featured?: boolean }) {
  const author = post.author;
  const role = author.role as "student" | "teacher" | "alumni";
  const gradient = COVER_GRADIENTS[post.coverColor || "slate"] || COVER_GRADIENTS.slate;

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article
        className={cn(
          "relative overflow-hidden rounded-xl border border-line bg-bg-soft transition-all duration-300",
          "hover:border-accent/30 hover:-translate-y-0.5",
          featured ? "sm:grid sm:grid-cols-[1.4fr_1fr] sm:gap-0" : ""
        )}
      >
        {/* Cover gradient placeholder */}
        <div className={cn("relative h-44 sm:h-48 bg-gradient-to-br", gradient, featured && "sm:h-full sm:min-h-[260px]")}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
          {post.category ? (
            <div className="absolute top-4 left-4">
              <Badge variant="default" className="bg-black/30 backdrop-blur-sm border-white/15 text-bg">
                {post.category}
              </Badge>
            </div>
          ) : null}
          {featured ? (
            <div className="absolute bottom-4 left-4 right-4 sm:hidden">
              <p className="text-xs uppercase tracking-widest text-fg-muted">Featured</p>
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-fg-muted mb-3">
            <Clock className="h-3 w-3" />
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>

          <h3 className={cn("font-serif tracking-tight leading-snug group-hover:text-accent transition-colors", featured ? "text-2xl md:text-3xl" : "text-lg")}>
            {post.title}
          </h3>

          {post.excerpt ? (
            <p className={cn("text-fg-muted mt-3 leading-relaxed", featured ? "text-base line-clamp-3" : "text-sm line-clamp-2")}>
              {post.excerpt}
            </p>
          ) : null}

          {/* Author byline */}
          <div className="mt-5 pt-4 border-t border-line flex items-center gap-3">
            <Avatar src={author.avatarUrl} name={author.fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-medium truncate">{author.fullName}</p>
                <ArrowUpRight className="h-3 w-3 text-fg-dim flex-shrink-0" />
              </div>
              <p className="text-xs text-fg-muted truncate flex items-center gap-1.5 mt-0.5">
                <span className="text-accent font-medium">{role === "teacher" ? author.designation || ROLE_LABELS[role] : ROLE_LABELS[role]}</span>
                <span className="text-fg-dim">·</span>
                <span className="truncate">{author.university.name}</span>
                {author.department ? (
                  <>
                    <span className="text-fg-dim">·</span>
                    <span className="truncate">{author.department.name}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
