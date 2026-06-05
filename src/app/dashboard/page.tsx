import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CheckCircle2, Clock, XCircle, ArrowRight, Shield, Trash2, Upload, PenLine } from "lucide-react";
import Link from "next/link";
import { ROLE_LABELS, STATUS_LABELS, STATUS_COLORS, formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export const dynamic = "force-dynamic";


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const profile = await prisma.profile.findUnique({
    where: { id: (session.user as any).id },
    include: { university: true, department: true, verificationRequest: true },
  });
  if (!profile) redirect("/login");

  const postCount = profile.status === "verified"
    ? await prisma.post.count({ where: { authorId: profile.id, status: "published" } })
    : 0;

  return (
    <div className="container-page py-12 max-w-4xl">
      <div className="flex items-start gap-4 mb-8">
        <Avatar src={profile.avatarUrl} name={profile.fullName} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-2xl md:text-3xl tracking-tight">{profile.fullName}</h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${STATUS_COLORS[profile.status]}`}>
              {STATUS_LABELS[profile.status]}
            </span>
          </div>
          <p className="text-sm text-fg-muted mt-1">
            {ROLE_LABELS[profile.role]} · {profile.university.name}
            {profile.department ? ` · ${profile.department.name}` : ""}
          </p>
        </div>
      </div>

      {profile.status === "pending" ? <PendingCard /> : null}
      {profile.status === "rejected" ? <RejectedCard reason={profile.rejectionReason} /> : null}
      {profile.status === "suspended" ? <SuspendedCard /> : null}
      {profile.status === "verified" ? <VerifiedActions handle={profile.handle} /> : null}

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Email and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Email" value={profile.email} />
            <Row label="Joined" value={formatDate(profile.createdAt)} />
            <div className="pt-3 flex gap-2">
              <Link href="/dashboard/settings"><Button variant="outline" size="sm">Settings</Button></Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Public profile</CardTitle>
            <CardDescription>What others see in the directory</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.status === "verified" ? (
              <Link href={`/u/${profile.handle}`} className="text-sm text-accent hover:underline flex items-center gap-1">
                View live profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <p className="text-xs text-fg-muted">Your profile will be public once verified.</p>
            )}
            {profile.status === "verified" ? (
              <div className="pt-3">
                <Link href="/dashboard/profile"><Button variant="outline" size="sm">Edit profile</Button></Link>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posts</CardTitle>
            <CardDescription>Your contributions to the community</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.status === "verified" && ["student", "teacher", "alumni"].includes(profile.role) ? (
              <>
                <p className="text-2xl font-serif">{postCount}</p>
                <p className="text-xs text-fg-muted mb-3">published</p>
                <div className="flex gap-2 flex-wrap">
                  <Link href="/dashboard/posts"><Button variant="outline" size="sm">My posts</Button></Link>
                  <Link href="/dashboard/posts/new"><Button size="sm"><PenLine className="h-3.5 w-3.5" /> Write</Button></Link>
                </div>
              </>
            ) : (
              <p className="text-xs text-fg-muted">Posts available after verification.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted text-xs uppercase tracking-wider">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function PendingCard() {
  return (
    <Card className="border-warning/20 bg-warning/[0.03]">
      <CardContent className="py-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Awaiting admin verification</h2>
            <p className="text-sm text-fg-muted mt-1">
              Your submission is in the queue. We typically review registrations within 24–48 hours. You&apos;ll receive an email once a decision is made.
            </p>
            <p className="text-xs text-fg-dim mt-3">
              <Shield className="inline h-3 w-3 mr-1" />
              ID card images are private and only visible to Gonix admins.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RejectedCard({ reason }: { reason: string | null }) {
  return (
    <Card className="border-danger/20 bg-danger/[0.03]">
      <CardContent className="py-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger flex-shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Verification could not be completed</h2>
            {reason ? <p className="text-sm text-fg-muted mt-1">Reason: {reason}</p> : null}
            <p className="text-sm text-fg-muted mt-3">
              You may re-submit your registration with corrected information. Please make sure your ID photo is clear and your ID number matches exactly.
            </p>
            <div className="pt-3">
              <Link href="/register"><Button size="sm"><Upload className="h-4 w-4" /> Re-submit registration</Button></Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SuspendedCard() {
  return (
    <Card className="border-danger/20 bg-danger/[0.03]">
      <CardContent className="py-8">
        <h2 className="text-lg font-semibold">Account suspended</h2>
        <p className="text-sm text-fg-muted mt-2">Your account has been suspended for review. Please contact support.</p>
      </CardContent>
    </Card>
  );
}

function VerifiedActions({ handle }: { handle: string }) {
  return (
    <Card className="border-success/20 bg-success/[0.03]">
      <CardContent className="py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Your profile is live</p>
            <p className="text-xs text-fg-muted">Others can now find you in the directory.</p>
          </div>
          <Link href={`/u/${handle}`}><Button variant="outline" size="sm">View <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </CardContent>
    </Card>
  );
}
