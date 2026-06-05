"use server";

import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  excerpt: z.string().max(300).optional().or(z.literal("")),
  body: z.string().min(50, "Body must be at least 50 characters").max(50000),
  category: z.string().max(40).optional().or(z.literal("")),
  coverColor: z.enum(["amber", "emerald", "rose", "indigo", "violet", "teal", "slate"]).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function createPost(_prev: any, fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };

  const profile = await prisma.profile.findUnique({ where: { id: (session.user as any).id } });
  if (!profile || profile.status !== "verified") {
    return { error: "Only verified users can publish posts" };
  }
  if (!["student", "teacher", "alumni"].includes(profile.role)) {
    return { error: "Admins cannot publish posts" };
  }

  const parsed = postSchema.safeParse({
    title: fd.get("title"),
    excerpt: fd.get("excerpt") || undefined,
    body: fd.get("body"),
    category: fd.get("category") || undefined,
    coverColor: fd.get("coverColor") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const baseSlug = slugify(parsed.data.title) || `post-${Date.now()}`;
  let slug = baseSlug;
  let n = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const post = await prisma.post.create({
    data: {
      authorId: profile.id,
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt || null,
      body: parsed.data.body,
      category: parsed.data.category || null,
      coverColor: parsed.data.coverColor || "slate",
      status: "published",
    },
  });

  revalidatePath("/");
  return { success: "Post published", slug: post.slug };
}

export async function updatePost(_prev: any, fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };

  const postId = String(fd.get("postId") || "");
  if (!postId) return { error: "Missing post id" };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found" };
  if (post.authorId !== (session.user as any).id) return { error: "Not authorized" };

  const parsed = postSchema.safeParse({
    title: fd.get("title"),
    excerpt: fd.get("excerpt") || undefined,
    body: fd.get("body"),
    category: fd.get("category") || undefined,
    coverColor: fd.get("coverColor") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: parsed.data.title,
      excerpt: parsed.data.excerpt || null,
      body: parsed.data.body,
      category: parsed.data.category || null,
      coverColor: parsed.data.coverColor || "slate",
    },
  });

  revalidatePath("/");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/dashboard/posts");
  return { success: "Post updated", slug: post.slug };
}

export async function publishPost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Not found" };
  if (post.authorId !== (session.user as any).id && !isAdmin((session.user as any).role)) {
    return { error: "Not authorized" };
  }
  await prisma.post.update({ where: { id: postId }, data: { status: "published" } });
  revalidatePath("/");
  revalidatePath(`/blog/${post.slug}`);
  return { success: true };
}

export async function hidePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Not found" };
  if (post.authorId !== (session.user as any).id && !isAdmin((session.user as any).role)) {
    return { error: "Not authorized" };
  }
  await prisma.post.update({ where: { id: postId }, data: { status: "hidden" } });
  revalidatePath("/");
  revalidatePath(`/blog/${post.slug}`);
  return { success: true };
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Not found" };
  if (post.authorId !== (session.user as any).id && !isAdmin((session.user as any).role)) {
    return { error: "Not authorized" };
  }
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/");
  revalidatePath("/dashboard/posts");
  return { success: true };
}
