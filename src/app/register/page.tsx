import { RoleChooser } from "@/components/registration/RoleChooser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata = { title: "Get verified" };

export const dynamic = "force-dynamic";


export default function RegisterPage() {
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-3">Get verified on Gonix</h1>
        <p className="text-fg-muted">
          Choose your role to begin. Each registration takes about 2 minutes. An admin reviews your submission within 24–48 hours.
        </p>
      </div>
      <RoleChooser />
      <Card className="mt-10 border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-base">What you&apos;ll need</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-fg-muted space-y-1.5">
            <li>• A clear photo of your university-issued ID card (JPG, PNG, or WebP, max 5 MB)</li>
            <li>• Your student / faculty ID number exactly as printed on the card</li>
            <li>• An institutional email (<code className="text-fg">.edu.bd</code> or your university&apos;s domain) is preferred</li>
            <li>• ID card images are private and only visible to Gonix admins</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
