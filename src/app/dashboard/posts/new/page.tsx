import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PostEditor } from "../editor";

export const metadata = { title: "New post" };

export const dynamic = "force-dynamic";


export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/posts/new");

  const profile = await prisma.profile.findUnique({ where: { id: (session.user as any).id } });
  if (!profile) redirect("/login");
  if (profile.status !== "verified") redirect("/dashboard");
  if (!["student", "teacher", "alumni"].includes(profile.role)) redirect("/dashboard");

  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-serif text-2xl md:text-3xl tracking-tight mb-2">Write a new post</h1>
      <p className="text-sm text-fg-muted mb-8">Share an experience, a research insight, an opinion, or a tutorial. Posts go live immediately — you can unpublish anytime.</p>
      <PostEditor mode="create" />
    </div>
  );
}
