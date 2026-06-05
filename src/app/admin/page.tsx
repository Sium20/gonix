import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ShieldCheck, AlertCircle, Users, Building2, TrendingUp } from "lucide-react";
import { timeAgo, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

export const metadata = { title: "Admin Overview" };

export const dynamic = "force-dynamic";


export default async function AdminDashboard() {
  const [
    pendingCount,
    pending24h,
    pending48h,
    verifiedThisWeek,
    rejectedThisWeek,
    totalVerified,
    totalUniversities,
    recent,
    breakdown,
  ] = await Promise.all([
    prisma.verificationRequest.count({ where: { decision: "pending" } }),
    prisma.verificationRequest.count({ where: { decision: "pending", submittedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.verificationRequest.count({ where: { decision: "pending", submittedAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) } } }),
    prisma.profile.count({ where: { status: "verified", verifiedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.profile.count({ where: { status: "rejected", updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.profile.count({ where: { status: "verified" } }),
    prisma.university.count({ where: { isActive: true } }),
    prisma.verificationRequest.findMany({
      where: { decision: "pending" },
      include: { profile: { include: { university: true } } },
      orderBy: { submittedAt: "asc" },
      take: 5,
    }),
    prisma.profile.groupBy({
      by: ["role"],
      where: { status: "verified", deletedAt: null },
      _count: true,
    }),
  ]);

  const approvalRate = verifiedThisWeek + rejectedThisWeek > 0
    ? Math.round((verifiedThisWeek / (verifiedThisWeek + rejectedThisWeek)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Overview</h2>
        <p className="text-sm text-fg-muted">Verification queue health and platform metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Pending"
          value={pendingCount}
          highlight={pending48h > 0 ? "danger" : pending24h > 0 ? "warning" : undefined}
          sub={pending48h > 0 ? `${pending48h} over 48h` : `${pending24h} in last 24h`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Approved / week"
          value={verifiedThisWeek}
          sub={`${approvalRate}% approval rate`}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total verified"
          value={totalVerified}
        />
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Universities"
          value={totalUniversities}
        />
      </div>

      {/* Breakdown */}
      <div className="grid sm:grid-cols-3 gap-4">
        {breakdown.map((b) => (
          <Card key={b.role}>
            <CardContent className="py-5">
              <p className="text-xs uppercase tracking-wider text-fg-muted">{b.role}s</p>
              <p className="text-2xl font-serif mt-1">{b._count.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Oldest in queue</CardTitle>
            <CardDescription>Approve or reject from the verification page</CardDescription>
          </div>
          <Link href="/admin/verifications">
            <Button variant="outline" size="sm">Open queue</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-fg-muted py-8 text-center">All clear. No pending verifications.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={r.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.profile.fullName}</p>
                    <p className="text-xs text-fg-muted truncate">
                      {r.profile.role} · {r.profile.university.name} · {timeAgo(r.submittedAt)}
                    </p>
                  </div>
                  <Link href={`/admin/verifications/${r.id}`}>
                    <Button size="sm" variant="outline">Review</Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: number; sub?: string; highlight?: "warning" | "danger" }) {
  return (
    <Card className={highlight === "danger" ? "border-danger/30" : highlight === "warning" ? "border-warning/30" : ""}>
      <CardContent className="py-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-fg-muted">{label}</p>
          <span className="text-fg-dim">{icon}</span>
        </div>
        <p className="text-2xl font-serif mt-2">{value.toLocaleString()}</p>
        {sub ? (
          <p className={`text-xs mt-1 ${highlight === "danger" ? "text-danger" : highlight === "warning" ? "text-amber-700" : "text-fg-muted"}`}>
            {highlight === "danger" ? <AlertCircle className="inline h-3 w-3 mr-1" /> : null}
            {sub}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
