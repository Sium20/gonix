import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Registration submitted" };

export const dynamic = "force-dynamic";


export default function SuccessPage({ searchParams }: { searchParams: { role?: string; handle?: string } }) {
  const role = searchParams.role || "student";
  return (
    <div className="container-page py-20 max-w-xl mx-auto">
      <Card className="text-center">
        <CardContent className="py-12">
          <div className="h-16 w-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-emerald-700 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl tracking-tight mt-6">You&apos;re in the queue</h1>
          <p className="text-fg-muted mt-3 max-w-md mx-auto">
            Your <Badge variant="gold">{role}</Badge> registration has been received. A Gonix admin will review your ID card and ID number within 24–48 hours.
          </p>
          {searchParams.handle ? (
            <p className="text-xs text-fg-dim mt-4 font-mono">@{searchParams.handle}</p>
          ) : null}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/dashboard">
              <Button>Go to dashboard <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
