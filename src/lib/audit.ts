import { prisma } from "./db";

export async function logIdCardAccess(args: {
  adminId: string;
  verificationRequestId: string;
  profileId: string;
  field: string;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: args.adminId,
      action: "id_card.viewed",
      targetType: "verification_request",
      targetId: args.verificationRequestId,
      metadata: JSON.stringify({ profileId: args.profileId, field: args.field }),
      ipAddress: args.ipAddress,
    },
  });
}
