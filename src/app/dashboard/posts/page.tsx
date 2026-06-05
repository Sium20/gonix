import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PenLine, Eye, EyeOff, Edit, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Posts" };

export const dynamic = "force-dynamic";


export default async function MyPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/posts");
  const profile = await prisma.profile.findUnique({ where: { id: (session.user as any).id } });
  if (!profile) redirect("/login");
  if (profile.status !== "verified") {
    return (
      <div className="container-page py-12 max-w-2xl">
        <h1 className="font-serif text-2xl md:text-3xl tracking-tight mb-2">My posts</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-fg-muted">You can publish posts once your profile is verified.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const posts = await prisma.post.findMany({
    where: { authorId: profile.id },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="container-page py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl tracking-tight">My posts</h1>
          <p className="text-sm text-fg-muted mt-1">{posts.length} total · {posts.filter(p => p.status === "published").length} published</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button>
            <Plus className="h-4 w-4" /> New post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-fg-dim mb-3 flex justify-center"><PenLine className="h-10 w-10" /></div>
          <h3 className="font-semibold">No posts yet</h3>
          <p className="text-sm text-fg-muted mt-1 mb-6">Share an experience, a research insight, or an opinion with the community.</p>
          <Link href="/dashboard/posts/new">
            <Button>Write your first post</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} className="hover:border-accent/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {p.category ? <Badge variant="muted">{p.category}</Badge> : null}
                    {p.status === "published" ? (
                      <Badge variant="success"><Eye className="h-3 w-3" /> Published</Badge>
                    ) : p.status === "hidden" ? (
                      <Badge variant="warning"><EyeOff className="h-3 w-3" /> Hidden</Badge>
                    ) : (
                      <Badge variant="muted">{p.status}</Badge>
                    )}
                  </div>
                  <Link href={`/blog/${p.slug}`} className="text-base font-semibold hover:text-accent">
                    {p.title}
                  </Link>
                  {p.excerpt ? (
                    <p className="text-sm text-fg-muted mt-1 line-clamp-2">{p.excerpt}</p>
                  ) : null}
                  <p className="text-xs text-fg-dim mt-2">
                    Published {formatDate(p.publishedAt)} · Updated {formatDate(p.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link href={`/dashboard/posts/${p.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Link href={`/blog/${p.slug}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
