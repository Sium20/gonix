import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readUpload, resolveUploadUrl } from "@/lib/storage";
import { promises as fs } from "fs";
import { logIdCardAccess } from "@/lib/audit";

export const dynamic = "force-dynamic";


export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  if (!isAdmin((session.user as any).role)) return new NextResponse("Forbidden", { status: 403 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") === "supporting" ? "supportingDocPath" : "idCardFrontPath";

  const vr = await prisma.verificationRequest.findUnique({ where: { id: params.id } });
  if (!vr) return new NextResponse("Not found", { status: 404 });

  const relPath = (vr as any)[type];
  if (!relPath) return new NextResponse("No file", { status: 404 });

  const remoteUrl = await resolveUploadUrl(relPath);
  if (remoteUrl) {
    // Keep access control and auditing in this route, then redirect to the object URL.
    return NextResponse.redirect(remoteUrl, { status: 302 });
  }

  const file = await readUpload(relPath);
  if (!file) return new NextResponse("File missing", { status: 404 });

  // Audit log: who accessed what
  await logIdCardAccess({
    adminId: (session.user as any).id,
    verificationRequestId: vr.id,
    profileId: vr.profileId,
    field: type,
    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
  });

  const buf = await fs.readFile(file.absPath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(buf.length),
      "Cache-Control": "private, max-age=300",
    },
  });
}
