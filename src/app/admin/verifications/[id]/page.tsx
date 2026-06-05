import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, X, MessageCircle, AlertTriangle, Mail, Phone, Building2, Calendar, GraduationCap, Hash, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ROLE_LABELS, formatDate, timeAgo, maskId } from "@/lib/utils";
import { ReviewActions } from "./review-actions";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";


export default async function VerificationDetailPage({ params }: Props) {
  const req = await prisma.verificationRequest.findUnique({
    where: { id: params.id },
    include: {
      profile: { include: { university: true, department: true } },
      university: true,
    },
  });
  if (!req) notFound();

  const p = req.profile;
  const ageHours = (Date.now() - new Date(req.submittedAt).getTime()) / (1000 * 60 * 60);
  const isStale = ageHours > 48;
  const flags = [req.emailDomainMatch === false, req.duplicateIdFlag, req.lowQualityFlag, req.vpnFlag].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/verifications" className="text-fg-muted hover:text-fg flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to queue
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Left: ID card + decision */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-fg-muted flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> ID card evidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {req.idCardFrontPath ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/id-card/${req.id}`}
                    alt="ID card"
                    className="w-full rounded-md border border-line bg-bg-soft"
                  />
                  <p className="text-xs text-fg-dim">Front of ID card. Click to open full size in a new tab.</p>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-line p-8 text-center text-sm text-fg-muted">
                  No ID card uploaded
                </div>
              )}
              {req.supportingDocPath ? (
                <div className="mt-4">
                  <p className="text-xs text-fg-muted mb-2">Supporting document:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/id-card/${req.id}?type=supporting`}
                    alt="Supporting document"
                    className="w-full rounded-md border border-line bg-bg-soft"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          {req.decision === "pending" ? (
            <ReviewActions requestId={req.id} profileName={p.fullName} />
          ) : (
            <Card>
              <CardContent className="py-5">
                <p className="text-sm">
                  Decision:{" "}
                  <Badge variant={req.decision === "approved" ? "success" : "danger"}>
                    {req.decision}
                  </Badge>
                </p>
                {req.decisionNotes ? <p className="text-sm text-fg-muted mt-2">Notes: {req.decisionNotes}</p> : null}
                <p className="text-xs text-fg-dim mt-2">Decided {req.decidedAt ? timeAgo(req.decidedAt) : "—"}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: profile details */}
        <div className="space-y-4">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <Avatar src={p.avatarUrl} name={p.fullName} size="lg" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight">{p.fullName}</h2>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge variant="gold">{ROLE_LABELS[p.role]}</Badge>
                    {p.designation ? <Badge>{p.designation}</Badge> : null}
                    {p.degree ? <Badge>{p.degree}</Badge> : null}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <Row icon={<Hash className="h-3.5 w-3.5" />} label="Declared ID">{req.declaredIdNumber || "—"}</Row>
                <Row icon={<Mail className="h-3.5 w-3.5" />} label="Email">
                  {p.email}
                </Row>
                {p.phone ? <Row icon={<Phone className="h-3.5 w-3.5" />} label="Phone">{p.phone}</Row> : null}
                {req.institutionalEmail ? <Row icon={<Mail className="h-3.5 w-3.5" />} label="Institutional">
                  {req.institutionalEmail} {req.emailDomainMatch ? <Badge variant="success" className="ml-1">domain ✓</Badge> : <Badge variant="warning" className="ml-1">no match</Badge>}
                </Row> : null}
                <Row icon={<Building2 className="h-3.5 w-3.5" />} label="University">{p.university.name}</Row>
                {p.department ? <Row icon={<GraduationCap className="h-3.5 w-3.5" />} label="Department">{p.department.name}</Row> : null}
                {p.batchYear ? <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Batch">{p.batchYear}{p.graduationYear ? ` — Grad ${p.graduationYear}` : ""}</Row> : null}
                <Row icon={<Hash className="h-3.5 w-3.5" />} label="Masked ID">{maskId(p.studentId || p.facultyId)}</Row>
                <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Submitted">{timeAgo(req.submittedAt)}</Row>
              </div>
            </CardContent>
          </Card>

          {flags.length > 0 || isStale ? (
            <Card className={isStale ? "border-danger/30 bg-danger/[0.03]" : "border-warning/30 bg-warning/[0.03]"}>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`h-4 w-4 ${isStale ? "text-danger" : "text-amber-700"}`} />
                  <p className="text-sm font-medium">{isStale ? "Over 48 hours old" : "Risk flags"}</p>
                </div>
                <ul className="text-xs text-fg-muted space-y-1">
                  {isStale ? <li>• Pending for {Math.round(ageHours)}h — consider expediting</li> : null}
                  {req.emailDomainMatch === false ? <li>• Institutional email domain does not match university</li> : null}
                  {req.duplicateIdFlag ? <li>• Possible duplicate ID number</li> : null}
                  {req.lowQualityFlag ? <li>• ID card image may be low quality</li> : null}
                  {req.vpnFlag ? <li>• Registration from a non-BD IP or VPN</li> : null}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {p.bio ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-fg-muted">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-fg-muted">{p.bio}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-fg-dim">{icon}</span>
      <span className="text-xs uppercase tracking-wider text-fg-dim w-24 flex-shrink-0">{label}</span>
      <span className="text-fg flex-1 truncate">{children}</span>
    </div>
  );
}
