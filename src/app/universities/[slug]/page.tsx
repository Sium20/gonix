import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Building2, ExternalLink, Globe, Users } from "lucide-react";
import { ROLE_LABELS } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const uni = await prisma.university.findUnique({ where: { slug: params.slug } });
  if (!uni) return { title: "University not found" };
  return { title: uni.name, description: `Verified ${ROLE_LABELS.student.toLowerCase()}s, teachers, and alumni from ${uni.fullName || uni.name}.` };
}

export const dynamic = "force-dynamic";


export default async function UniversityDetailPage({ params }: Props) {
  const uni = await prisma.university.findUnique({
    where: { slug: params.slug },
    include: {
      departments: { where: { isActive: true }, orderBy: { name: "asc" } },
      _count: { select: { profiles: { where: { status: "verified", deletedAt: null } } } },
    },
  });
  if (!uni) notFound();

  const [students, teachers, alumni, departmentsWithCounts] = await Promise.all([
    prisma.profile.count({ where: { universityId: uni.id, role: "student", status: "verified", deletedAt: null } }),
    prisma.profile.count({ where: { universityId: uni.id, role: "teacher", status: "verified", deletedAt: null } }),
    prisma.profile.count({ where: { universityId: uni.id, role: "alumni", status: "verified", deletedAt: null } }),
    prisma.department.findMany({
      where: { universityId: uni.id, isActive: true },
      include: { _count: { select: { profiles: { where: { status: "verified", deletedAt: null } } } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const recent = await prisma.profile.findMany({
    where: { universityId: uni.id, status: "verified", deletedAt: null },
    include: { university: true, department: true },
    orderBy: { verifiedAt: "desc" },
    take: 12,
  });

  return (
    <div className="container-page py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
        <div className="h-20 w-20 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <Building2 className="h-9 w-9" />
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight">{uni.name}</h1>
          {uni.fullName ? <p className="text-fg-muted mt-1">{uni.fullName}</p> : null}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="muted">{uni.type}</Badge>
            {uni.city ? <Badge variant="muted">{uni.city}</Badge> : null}
            {uni.division ? <Badge variant="muted">{uni.division}</Badge> : null}
            {uni.website ? (
              <a href={uni.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                <Globe className="h-3 w-3" /> Website <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-serif">{uni._count.profiles}</p>
          <p className="text-xs text-fg-muted uppercase tracking-wider">verified members</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="Students" value={students} />
        <StatCard label="Teachers" value={teachers} />
        <StatCard label="Alumni" value={alumni} />
      </div>

      {/* Departments */}
      {departmentsWithCounts.length > 0 ? (
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-3">Departments</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {departmentsWithCounts.map((d) => (
              <Link
                key={d.id}
                href={{ pathname: "/search", query: { universityId: uni.id, departmentId: d.id } }}
                className="block p-3 rounded-md border border-line bg-bg-soft hover:border-accent/30 transition-colors"
              >
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-fg-muted mt-0.5">{d._count.profiles} verified</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recent members */}
      {recent.length > 0 ? (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-3">Recent members</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((p) => (
              <Link key={p.id} href={`/u/${p.handle}`} className="block">
                <Card className="hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <Avatar src={p.avatarUrl} name={p.fullName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate">{p.fullName}</p>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-fg-muted mt-0.5">
                        {p.role === "teacher" ? (p.designation || "Teacher") : ROLE_LABELS[p.role]}
                      </p>
                      {p.department ? <p className="text-xs text-fg-dim truncate mt-0.5">{p.department.name}</p> : null}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-5 text-center">
        <p className="text-2xl font-serif">{value}</p>
        <p className="text-xs text-fg-muted uppercase tracking-wider mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
