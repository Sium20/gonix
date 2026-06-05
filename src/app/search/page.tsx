import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, Search as SearchIcon, Filter } from "lucide-react";
import { SearchFilters } from "./filters";
import { ROLE_LABELS } from "@/lib/utils";

export const metadata = { title: "Directory" };

const PAGE_SIZE = 24;

export const dynamic = "force-dynamic";


export default async function SearchPage({ searchParams }: { searchParams: any }) {
  const q = (searchParams.q || "").toString().trim();
  const role = (searchParams.role || "").toString();
  const universityId = (searchParams.universityId || "").toString();
  const departmentId = (searchParams.departmentId || "").toString();
  const batchYear = (searchParams.batchYear || "").toString();
  const page = Math.max(1, parseInt((searchParams.page || "1").toString()));

  const where: any = { status: "verified", deletedAt: null };
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { bio: { contains: q } },
      { currentCompany: { contains: q } },
      { currentTitle: { contains: q } },
    ];
  }
  if (role) where.role = role;
  if (universityId) where.universityId = universityId;
  if (departmentId) where.departmentId = departmentId;
  if (batchYear) where.batchYear = parseInt(batchYear);

  const [profiles, total, universities] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: { university: true, department: true },
      orderBy: { verifiedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.profile.count({ where }),
    prisma.university.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight">Directory</h1>
        <p className="text-fg-muted mt-1">{total.toLocaleString()} verified {total === 1 ? "person" : "people"}</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside>
          <SearchFilters universities={universities} initial={{ q, role, universityId, departmentId, batchYear }} />
        </aside>

        <div>
          {profiles.length === 0 ? (
            <Card className="text-center py-16">
              <div className="text-fg-dim mb-3 flex justify-center"><SearchIcon className="h-10 w-10" /></div>
              <p className="font-medium">No matches</p>
              <p className="text-sm text-fg-muted mt-1">Try removing some filters.</p>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {profiles.map((p) => (
                  <Link key={p.id} href={`/u/${p.handle}`} className="block">
                    <Card className="hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200 h-full">
                      <div className="flex items-start gap-3">
                        <Avatar src={p.avatarUrl} name={p.fullName} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold truncate">{p.fullName}</p>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-fg-muted truncate mt-0.5">
                            {p.role === "teacher" ? p.designation || "Teacher" : ROLE_LABELS[p.role]}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge variant="muted">{p.university.name}</Badge>
                        {p.department ? <Badge variant="muted">{p.department.name}</Badge> : null}
                        {p.batchYear ? <Badge variant="muted">{`'${String(p.batchYear).slice(-2)}`}</Badge> : null}
                      </div>
                      {p.bio ? <p className="text-xs text-fg-muted mt-3 line-clamp-2">{p.bio}</p> : null}
                    </Card>
                  </Link>
                ))}
              </div>

              {total > page * PAGE_SIZE ? (
                <div className="mt-8 text-center">
                  <Link
                    href={{ pathname: "/search", query: { ...searchParams, page: page + 1 } }}
                    className="inline-block px-6 py-2.5 rounded-md border border-line hover:bg-bg-soft text-sm"
                  >
                    Load more
                  </Link>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
