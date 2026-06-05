import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Building2, Users } from "lucide-react";

export const metadata = { title: "Universities" };

export const dynamic = "force-dynamic";


export default async function UniversitiesPage() {
  const universities = await prisma.university.findMany({
    where: { isActive: true },
    include: { _count: { select: { profiles: { where: { status: "verified", deletedAt: null } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container-page py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight">Universities</h1>
        <p className="text-fg-muted mt-1">{universities.length} institutions on Gonix</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {universities.map((u) => (
          <Link key={u.id} href={`/universities/${u.slug}`} className="block">
            <Card className="hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200 h-full">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  {u.fullName ? <p className="text-xs text-fg-muted mt-0.5 line-clamp-2">{u.fullName}</p> : null}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-fg-dim">
                    <Users className="h-3 w-3" />
                    <span>{u._count.profiles} verified</span>
                    {u.city ? <span>· {u.city}</span> : null}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                <Badge variant="muted">{u.type}</Badge>
                {u.domain ? <span className="text-[10px] text-fg-dim font-mono">@{u.domain}</span> : null}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
