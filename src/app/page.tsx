import Link from "next/link";
import { prisma } from "@/lib/db";
import { PostCard, estimateReadingMinutes } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Shield, Search, ArrowRight, PenLine } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Gonix — Verified Academic Network for Bangladesh",
  description: "Read, write, and connect with verified students, teachers, and alumni of Bangladeshi universities.",
};

const PAGE_SIZE = 20;

export const dynamic = "force-dynamic";


export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const session = await getServerSession(authOptions);
  const page = Math.max(1, parseInt(searchParams.page || "1"));

  const [posts, total, categories] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published" },
      include: {
        author: {
          include: { university: true, department: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.groupBy({
      by: ["category"],
      where: { status: "published", category: { not: null } },
      _count: true,
    }),
  ]);

  // Compute reading minutes for each post
  const postsWithMeta = posts.map((p) => ({
    ...p,
    readingMinutes: estimateReadingMinutes(p.body),
  }));

  const [first, ...rest] = postsWithMeta;
  const showHero = page === 1 && first;

  return (
    <>
      {/* Slim intro — only on first page */}
      {page === 1 ? (
        <section className="relative overflow-hidden border-b border-line">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent pointer-events-none" />
          <div className="container-page py-10 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">From the academic community</p>
                <h1 className="font-serif text-3xl md:text-4xl tracking-tight">Stories, research, and experiences from BD universities</h1>
                <p className="text-sm text-fg-muted mt-2">Every author is admin-verified. No bots, no spam, no fakes.</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href="/search">
                  <Button variant="outline" size="sm">
                    <Search className="h-3.5 w-3.5" /> Directory
                  </Button>
                </Link>
                {session?.user ? (
                  <Link href="/dashboard/posts/new">
                    <Button size="sm">
                      <PenLine className="h-3.5 w-3.5" /> Write a post
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button size="sm">Get verified <ArrowRight className="h-3.5 w-3.5" /></Button>
                  </Link>
                )}
              </div>
            </div>

            {categories.length > 0 ? (
              <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                <span className="text-xs text-fg-dim uppercase tracking-wider flex-shrink-0">Categories</span>
                {categories.sort((a, b) => b._count - a._count).map((c) => (
                  c.category ? (
                    <Link
                      key={c.category}
                      href={{ pathname: "/blog", query: { category: c.category } }}
                      className="flex-shrink-0 px-3 py-1 rounded-full text-xs border border-line bg-bg-soft hover:border-accent/40 hover:text-accent transition-colors"
                    >
                      {c.category} <span className="text-fg-dim ml-1">{c._count}</span>
                    </Link>
                  ) : null
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Feed */}
      <section className="container-page py-10">
        {postsWithMeta.length === 0 ? (
          <Card className="text-center py-16">
            <div className="text-fg-dim mb-3 flex justify-center"><PenLine className="h-10 w-10" /></div>
            <h3 className="text-lg font-semibold">No posts yet</h3>
            <p className="text-sm text-fg-muted mt-1">Be the first to write something.</p>
            {session?.user ? (
              <div className="mt-6">
                <Link href="/dashboard/posts/new">
                  <Button>Write the first post</Button>
                </Link>
              </div>
            ) : (
              <div className="mt-6">
                <Link href="/register">
                  <Button>Get verified to write</Button>
                </Link>
              </div>
            )}
          </Card>
        ) : (
          <>
            {showHero ? (
              <div className="mb-8">
                <PostCard post={first} featured />
              </div>
            ) : first ? (
              <div className="mb-8">
                <PostCard post={first} />
              </div>
            ) : null}

            {rest.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            ) : null}

            {total > page * PAGE_SIZE ? (
              <div className="mt-10 text-center">
                <Link
                  href={{ pathname: "/", query: { page: page + 1 } }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-line hover:bg-bg-soft text-sm"
                >
                  Load older posts <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}
          </>
        )}
      </section>

      {/* Slim role chooser footer (slim) */}
      {page === 1 ? (
        <section className="border-t border-line bg-bg-soft/30">
          <div className="container-page py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-fg-dim mb-1 flex items-center gap-1.5">
                  <Shield className="h-3 w-3" /> Every post author is admin-verified
                </p>
                <p className="text-sm text-fg-muted">Don&apos;t have an account? Pick your role to get verified.</p>
              </div>
              <Link href="/register">
                <Button variant="outline">Choose your role <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
