"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(80),
  bio: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  currentCompany: z.string().max(80).optional().or(z.literal("")),
  currentTitle: z.string().max(80).optional().or(z.literal("")),
  showEmail: z.coerce.boolean().optional(),
  showPhone: z.coerce.boolean().optional(),
  socialLinkedin: z.string().url().optional().or(z.literal("")),
  socialGithub: z.string().url().optional().or(z.literal("")),
});

export async function updateProfile(_prev: any, fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };

  const raw: Record<string, any> = {};
  for (const [k, v] of fd.entries()) raw[k] = v;
  raw.showEmail = fd.get("showEmail") === "on";
  raw.showPhone = fd.get("showPhone") === "on";

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  const d = parsed.data;
  const socialLinks: Record<string, string> = {};
  if (d.socialLinkedin) socialLinks.linkedin = d.socialLinkedin;
  if (d.socialGithub) socialLinks.github = d.socialGithub;

  await prisma.profile.update({
    where: { id: (session.user as any).id },
    data: {
      fullName: d.fullName,
      bio: d.bio || null,
      phone: d.phone || null,
      currentCompany: d.currentCompany || null,
      currentTitle: d.currentTitle || null,
      showEmail: !!d.showEmail,
      showPhone: !!d.showPhone,
      socialLinks: Object.keys(socialLinks).length ? JSON.stringify(socialLinks) : null,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/u/${(session.user as any).handle}`);
  return { success: "Profile updated" };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function changePassword(_prev: any, fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };
  const parsed = passwordSchema.safeParse({
    currentPassword: fd.get("currentPassword"),
    newPassword: fd.get("newPassword"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const profile = await prisma.profile.findUnique({ where: { id: (session.user as any).id } });
  if (!profile?.passwordHash) return { error: "Account has no password set" };
  const ok = await bcrypt.compare(parsed.data.currentPassword, profile.passwordHash);
  if (!ok) return { error: "Current password is incorrect" };
  await prisma.profile.update({
    where: { id: profile.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });
  return { success: "Password changed" };
}

export async function deleteOwnAccount() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };
  await prisma.profile.update({
    where: { id: (session.user as any).id },
    data: { deletedAt: new Date(), status: "suspended" },
  });
  return { success: "Account scheduled for deletion" };
}
