"use server";

import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const decisionSchema = z.object({
  requestId: z.string(),
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().max(500).optional(),
});

export async function decideVerification(_prev: any, fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };
  if (!isAdmin((session.user as any).role)) return { error: "Not authorized" };

  const parsed = decisionSchema.safeParse({
    requestId: fd.get("requestId"),
    decision: fd.get("decision"),
    notes: fd.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const req = await prisma.verificationRequest.findUnique({
    where: { id: parsed.data.requestId },
    include: { profile: true },
  });
  if (!req) return { error: "Request not found" };
  if (req.decision !== "pending") return { error: "Already decided" };

  if (parsed.data.decision === "approved") {
    await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: req.id },
        data: {
          decision: "approved",
          decidedAt: new Date(),
          decidedById: (session.user as any).id,
          decisionNotes: parsed.data.notes || null,
        },
      }),
      prisma.profile.update({
        where: { id: req.profileId },
        data: {
          status: "verified",
          verifiedAt: new Date(),
          verifiedById: (session.user as any).id,
          rejectionReason: null,
        },
      }),
    ]);
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: "verification.approved",
        targetType: "profile",
        targetId: req.profileId,
        metadata: JSON.stringify({ requestId: req.id }),
      },
    });
    await sendEmail({
      to: req.profile.email,
      ...emailTemplates.verificationApproved(req.profile.fullName),
    });
  } else {
    await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: req.id },
        data: {
          decision: "rejected",
          decidedAt: new Date(),
          decidedById: (session.user as any).id,
          decisionNotes: parsed.data.notes || null,
        },
      }),
      prisma.profile.update({
        where: { id: req.profileId },
        data: {
          status: "rejected",
          rejectionReason: parsed.data.notes || "Did not meet verification criteria",
        },
      }),
    ]);
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: "verification.rejected",
        targetType: "profile",
        targetId: req.profileId,
        metadata: JSON.stringify({ requestId: req.id, notes: parsed.data.notes }),
      },
    });
    await sendEmail({
      to: req.profile.email,
      ...emailTemplates.verificationRejected(req.profile.fullName, parsed.data.notes || "Criteria not met"),
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${req.id}`);
  return { success: "Decision recorded" };
}

export async function requestMoreInfo(_prev: any, fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };
  if (!isAdmin((session.user as any).role)) return { error: "Not authorized" };
  // Stub: just add an admin note and email. In a fuller app, this would change status to "info_requested"
  const requestId = String(fd.get("requestId") || "");
  const message = String(fd.get("message") || "");
  if (!message) return { error: "Message required" };
  const req = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    include: { profile: true },
  });
  if (!req) return { error: "Not found" };
  await prisma.adminNote.create({
    data: {
      profileId: req.profileId,
      adminId: (session.user as any).id,
      note: `[info requested] ${message}`,
    },
  });
  await sendEmail({
    to: req.profile.email,
    subject: "Gonix — more info needed for your verification",
    html: `<p>Hi ${req.profile.fullName},</p><p>Our admin needs more info: <em>${message}</em></p><p>— Gonix</p>`,
  });
  return { success: "Info requested email sent" };
}
