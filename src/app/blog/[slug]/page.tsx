import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, ArrowUpRight, Building2, GraduationCap, Clock, ShieldCheck, EyeOff, Eye, Trash2 } from "lucide-react";
import { ROLE_LABELS, formatDate } from "@/lib/utils";
import { PostActions } from "./post-actions";
import { PostBody } from "@/components/blog/PostBody";
import { estimateReadingMinutes } from "@/components/blog/PostCard";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { author: true },
  });
  if (!post || post.status !== "published") return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt || `${post.title} — by ${post.author.fullName}`,
  };
}

export const dynamic = "force-dynamic";


export default async function BlogPostPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: { include: { university: true, department: true } },
    },
  });

  if (!post) notFound();
  if (post.status !== "published" && post.authorId !== (session?.user as any)?.id && !isAdmin((session?.user as any)?.role)) {
    notFound();
  }

  const author = post.author;
  const isAuthor = session?.user && (session.user as any).id === post.authorId;
  const isAdminUser = isAdmin((session?.user as any)?.role);
  const readingMinutes = estimateReadingMinutes(post.body);

  return (
    <article className="container-page py-10 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
      </Link>

      {post.status !== "published" ? (
        <div className="mb-6 rounded-md border border-warning/30 bg-warning/[0.05] p-3 flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-amber-700" />
          <p className="text-sm text-amber-300">
            This post is currently <strong>{post.status}</strong>. Only the author and admins can see it.
          </p>
        </div>
      ) : null}

      <header className="mb-8">
        {post.category ? <Badge variant="default" className="mb-4">{post.category}</Badge> : null}
        <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">{post.title}</h1>
        {post.excerpt ? (
          <p className="text-lg text-fg-muted mt-4 leading-relaxed">{post.excerpt}</p>
        ) : null}

        {/* Author block */}
        <Card className="mt-8">
          <div className="flex items-start gap-4">
            <Avatar src={author.avatarUrl} name={author.fullName} size="lg" ring />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/u/${author.handle}`} className="text-base font-semibold hover:text-accent">
                  {author.fullName}
                </Link>
                <Badge variant="gold">
                  {author.role === "teacher" ? author.designation || ROLE_LABELS[author.role] : ROLE_LABELS[author.role]}
                </Badge>
                {isAdminUser || isAuthor ? <Badge variant="muted">{author.role}</Badge> : null}
              </div>
              <div className="mt-2 space-y-1 text-sm text-fg-muted">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <Link href={`/universities/${author.university.slug}`} className="hover:text-fg">
                    {author.university.fullName || author.university.name}
                  </Link>
                </div>
                {author.department ? (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{author.department.name}</span>
                    {author.batchYear ? <span className="text-fg-dim">· Batch {author.batchYear}</span> : null}
                  </div>
                ) : null}
                <div className="flex items-center gap-3 text-xs text-fg-dim pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {formatDate(post.publishedAt)}
                  </span>
                  <span>·</span>
                  <span>{readingMinutes} min read</span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck className="h-3 w-3" /> Verified author
                  </span>
                </div>
              </div>
            </div>
            <Link href={`/u/${author.handle}`} className="flex-shrink-0">
              <Button variant="outline" size="sm">
                View profile <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </header>

      {/* Body */}
      <PostBody body={post.body} />

      {/* Author actions */}
      {(isAuthor || isAdminUser) ? (
        <div className="mt-12 pt-6 border-t border-line">
          <p className="text-xs uppercase tracking-wider text-fg-dim mb-3">{isAdminUser && !isAuthor ? "Admin actions" : "Manage post"}</p>
          <PostActions postId={post.id} slug={post.slug} status={post.status} isAdmin={isAdminUser && !isAuthor} />
        </div>
      ) : null}
    </article>
  );
}
