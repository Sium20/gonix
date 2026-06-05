import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PostEditor } from "../../editor";

export const metadata = { title: "Edit post" };

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";


export default async function EditPostPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();
  if (post.authorId !== (session.user as any).id) redirect("/dashboard/posts");

  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-serif text-2xl md:text-3xl tracking-tight mb-2">Edit post</h1>
      <p className="text-sm text-fg-muted mb-8">Changes are saved when you click &quot;Save changes&quot;.</p>
      <PostEditor
        mode="edit"
        postId={post.id}
        initial={{
          title: post.title,
          excerpt: post.excerpt || "",
          body: post.body,
          category: post.category || "",
          coverColor: post.coverColor || "slate",
        }}
      />
    </div>
  );
}
