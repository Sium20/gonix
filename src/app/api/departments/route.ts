import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const universityId = searchParams.get("universityId");
  if (!universityId) {
    return NextResponse.json({ departments: [] });
  }
  const departments = await prisma.department.findMany({
    where: { universityId, isActive: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ departments });
}
