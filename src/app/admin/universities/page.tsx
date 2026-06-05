import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Universities (Admin)" };

export const dynamic = "force-dynamic";


export default async function AdminUniversitiesPage() {
  const universities = await prisma.university.findMany({
    include: { _count: { select: { profiles: true, departments: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Universities</h2>
        <p className="text-sm text-fg-muted">{universities.length} total</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-bg-soft/50">
              <tr>
                <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Name</th>
                <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Type</th>
                <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Domain</th>
                <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Depts</th>
                <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Profiles</th>
                <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {universities.map((u) => (
                <tr key={u.id} className="hover:bg-fg/[0.02]">
                  <td className="p-3">
                    <p className="font-medium">{u.name}</p>
                    {u.fullName ? <p className="text-xs text-fg-muted">{u.fullName}</p> : null}
                  </td>
                  <td className="p-3 text-fg-muted capitalize">{u.type}</td>
                  <td className="p-3 text-fg-muted font-mono text-xs">{u.domain || "—"}</td>
                  <td className="p-3 text-fg-muted">{u._count.departments}</td>
                  <td className="p-3 text-fg-muted">{u._count.profiles}</td>
                  <td className="p-3">{u.isActive ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
