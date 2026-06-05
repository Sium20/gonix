import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS, STATUS_COLORS, STATUS_LABELS, formatDate } from "@/lib/utils";

export const metadata = { title: "Users" };

export const dynamic = "force-dynamic";


export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const q = (searchParams.q || "").toString().trim();
  const status = (searchParams.status || "").toString();

  const where: any = { deletedAt: null };
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { email: { contains: q } },
      { handle: { contains: q } },
    ];
  }
  if (status) where.status = status;

  const profiles = await prisma.profile.findMany({
    where,
    include: { university: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Users</h2>
        <p className="text-sm text-fg-muted">All accounts (showing latest 100)</p>
      </div>

      <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input name="q" defaultValue={q} placeholder="Search by name, email, or handle" className="flex-1" />
        <select name="status" defaultValue={status} className="h-10 px-3 rounded-md bg-bg-soft border border-line text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {profiles.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-fg-muted">No users found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-bg-soft/50">
                <tr>
                  <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">User</th>
                  <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Role</th>
                  <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">University</th>
                  <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Status</th>
                  <th className="text-left p-3 font-medium text-fg-muted uppercase tracking-wider text-[10px]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-fg/[0.02]">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={p.avatarUrl} name={p.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.fullName}</p>
                          <p className="text-xs text-fg-muted truncate">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-fg-muted">{ROLE_LABELS[p.role] || p.role}</td>
                    <td className="p-3 text-fg-muted">{p.university?.name || "—"}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${STATUS_COLORS[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="p-3 text-fg-muted text-xs">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
