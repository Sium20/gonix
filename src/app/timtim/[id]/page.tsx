import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Wrench } from "lucide-react";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  return {
    title: `Project ${params.id}`,
    description: "View project details on TimTim.",
  };
}

export const dynamic = "force-dynamic";


export default function TimTimProjectDetailPage({ params }: Props) {
  // Detail rendering will be wired up when the TimTim data model lands.
  // For now, route exists for navigation and to give 404-style feedback.
  if (!params.id) notFound();

  return (
    <div className="container-page py-12 max-w-3xl">
      <Link href="/timtim/browse" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to projects
      </Link>

      <Card>
        <CardContent className="py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-4">
            <Wrench className="h-6 w-6" />
          </div>
          <p className="font-serif text-2xl tracking-tight">Project pages are coming soon</p>
          <p className="text-sm text-fg-muted mt-2 max-w-md mx-auto leading-relaxed">
            Project ID <span className="font-mono text-fg-dim">{params.id}</span> isn&apos;t backed by the database yet.
            The detail layout — owner, description, roles, applicants, contact — will be wired up with the TimTim
            data model.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/timtim/browse">
              <Button variant="outline">Browse projects</Button>
            </Link>
            <Link href="/timtim">
              <Button>How it works</Button>
            </Link>
          </div>
          <p className="text-[11px] text-fg-dim mt-6">
            <Badge variant="muted">Scaffold</Badge> This route exists so links don&apos;t 404 prematurely.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
