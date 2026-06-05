import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROLE_LABELS, timeAgo } from "@/lib/utils";
import { ShieldCheck, Search, AlertTriangle } from "lucide-react";

export const metadata = { title: "Verification Queue" };

export const dynamic = "force-dynamic";


export default async function VerificationsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const status = searchParams.status || "pending";
  const q = (searchParams.q || "").toString().trim();

  const where: any = { decision: status };
  const requests = await prisma.verificationRequest.findMany({
    where: {
      decision: status,
      ...(q ? {
        profile: {
          OR: [
            { fullName: { contains: q } },
            { email: { contains: q } },
          ],
        },
      } : {}),
    },
    include: { profile: { include: { university: true, department: true } } },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Verification queue</h2>
        <p className="text-sm text-fg-muted">{requests.length} {status}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-dim" />
            <Input name="q" defaultValue={q} placeholder="Search by name or email" className="pl-9" />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <div className="flex items-center gap-1">
          {["pending", "approved", "rejected"].map((s) => (
            <Link
              key={s}
              href={{ pathname: "/admin/verifications", query: { status: s, q } }}
              className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wider ${status === s ? "bg-accent text-black" : "bg-bg-soft border border-line text-fg-muted hover:text-fg"}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="text-center py-16">
          <ShieldCheck className="h-10 w-10 text-fg-dim mx-auto mb-3" />
          <p className="font-medium">No {status} verifications</p>
          <p className="text-sm text-fg-muted mt-1">
            {status === "pending" ? "Inbox zero. Nice work." : ""}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const ageMs = Date.now() - new Date(r.submittedAt).getTime();
            const ageHours = ageMs / (1000 * 60 * 60);
            const isStale = ageHours > 48;
            const flags = [r.emailDomainMatch === false, r.duplicateIdFlag, r.lowQualityFlag, r.vpnFlag].filter(Boolean).length;
            return (
              <Link key={r.id} href={`/admin/verifications/${r.id}`} className="block">
                <Card className="hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar src={r.profile.avatarUrl} name={r.profile.fullName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{r.profile.fullName}</p>
                        <Badge variant="muted">{ROLE_LABELS[r.profile.role]}</Badge>
                        {isStale ? <Badge variant="danger"><AlertTriangle className="h-3 w-3" /> &gt; 48h</Badge> : null}
                        {flags > 0 ? <Badge variant="warning">{flags} flag{flags > 1 ? "s" : ""}</Badge> : null}
                      </div>
                      <p className="text-xs text-fg-muted mt-1">
                        {r.profile.university.name}
                        {r.profile.department ? ` · ${r.profile.department.name}` : ""}
                        {r.declaredIdNumber ? ` · ID: ${r.declaredIdNumber}` : ""}
                      </p>
                      <p className="text-xs text-fg-dim mt-1">Submitted {timeAgo(r.submittedAt)}</p>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
