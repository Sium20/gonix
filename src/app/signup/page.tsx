import { SignupForm } from "./form";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Sign up" };

export const dynamic = "force-dynamic";


export default function SignupPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <div className="text-center mb-8">
        <Badge variant="gold" className="mb-3">
          <Shield className="h-3 w-3" /> Admin-verified
        </Badge>
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight">Get verified on Gonix</h1>
        <p className="text-fg-muted mt-2 text-sm max-w-xl mx-auto">
          One page. About 2 minutes. Your ID card is reviewed by a Gonix admin within 24–48 hours.
        </p>
      </div>

      <SignupForm />

      <Card className="mt-8">
        <p className="text-sm text-center text-fg-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
