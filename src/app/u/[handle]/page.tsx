import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Mail, Phone, Briefcase, Building2, Calendar, GraduationCap, Linkedin, Github } from "lucide-react";
import Link from "next/link";
import { ROLE_LABELS, maskId } from "@/lib/utils";

type Props = { params: { handle: string } };

export async function generateMetadata({ params }: Props) {
  const profile = await prisma.profile.findUnique({
    where: { handle: params.handle },
    select: { fullName: true, role: true, bio: true, status: true },
  });
  if (!profile || profile.status !== "verified") return { title: "Profile not found" };
  return {
    title: `${profile.fullName} — ${ROLE_LABELS[profile.role]}`,
    description: profile.bio || `${profile.fullName} is a verified ${ROLE_LABELS[profile.role].toLowerCase()} on Gonix.`,
  };
}

export const dynamic = "force-dynamic";


export default async function PublicProfilePage({ params }: Props) {
  const profile = await prisma.profile.findUnique({
    where: { handle: params.handle },
    include: { university: true, department: true },
  });

  if (!profile || profile.status !== "verified" || profile.deletedAt) notFound();

  const socials = profile.socialLinks ? JSON.parse(profile.socialLinks) : {};

  return (
    <div className="container-page py-12 max-w-4xl">
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar src={profile.avatarUrl} name={profile.fullName} size="xl" ring />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-3xl md:text-4xl tracking-tight">{profile.fullName}</h1>
                <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-label="Verified" />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="gold">{ROLE_LABELS[profile.role]}</Badge>
                {profile.designation ? <Badge>{profile.designation}</Badge> : null}
                {profile.degree ? <Badge>{profile.degree}</Badge> : null}
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <Info icon={<Building2 className="h-4 w-4" />} label="University">
                  {profile.university.fullName || profile.university.name}
                </Info>
                {profile.department ? (
                  <Info icon={<GraduationCap className="h-4 w-4" />} label="Department">
                    {profile.department.name}
                  </Info>
                ) : null}
                {profile.batchYear ? (
                  <Info icon={<Calendar className="h-4 w-4" />} label="Batch">
                    {profile.batchYear}
                    {profile.graduationYear ? ` — Graduated ${profile.graduationYear}` : ""}
                  </Info>
                ) : null}
                {profile.currentCompany || profile.currentTitle ? (
                  <Info icon={<Briefcase className="h-4 w-4" />} label="Currently">
                    {profile.currentTitle ? `${profile.currentTitle}` : ""}
                    {profile.currentCompany ? ` at ${profile.currentCompany}` : ""}
                  </Info>
                ) : null}
              </div>

              {profile.bio ? <p className="text-sm text-fg-muted mt-5 leading-relaxed">{profile.bio}</p> : null}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {profile.showEmail ? (
                  <a href={`mailto:${profile.email}`}>
                    <Button variant="outline" size="sm"><Mail className="h-4 w-4" /> Email</Button>
                  </a>
                ) : null}
                {profile.showPhone && profile.phone ? (
                  <a href={`tel:${profile.phone}`}>
                    <Button variant="outline" size="sm"><Phone className="h-4 w-4" /> Call</Button>
                  </a>
                ) : null}
                {socials.linkedin ? (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm"><Linkedin className="h-4 w-4" /> LinkedIn</Button>
                  </a>
                ) : null}
                {socials.github ? (
                  <a href={socials.github} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm"><Github className="h-4 w-4" /> GitHub</Button>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-fg-muted">Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>Identity verified by Gonix admin</span>
            </div>
            <p className="text-xs text-fg-dim mt-2">
              ID number on file: <span className="font-mono">{maskId(profile.studentId || profile.facultyId)}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-fg-muted">Activity</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-fg-muted space-y-1">
            <p>Member since {new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
            {profile.lastActiveAt ? <p>Last active {new Date(profile.lastActiveAt).toLocaleDateString()}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-fg-dim">{icon}</span>
      <span className="text-fg-muted text-xs uppercase tracking-wider w-20 flex-shrink-0">{label}</span>
      <span className="text-fg">{children}</span>
    </div>
  );
}
