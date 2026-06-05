import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";


export async function GET() {
  const universities = await prisma.university.findMany({
    where: { isActive: true },
    select: { id: true, name: true, fullName: true, type: true, city: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ universities });
}
