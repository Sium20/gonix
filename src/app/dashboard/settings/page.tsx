import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { SettingsForm } from "./form";

export const metadata = { title: "Settings" };

export const dynamic = "force-dynamic";


export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/settings");
  const profile = await prisma.profile.findUnique({ where: { id: (session.user as any).id } });
  if (!profile) redirect("/login");

  return (
    <div className="container-page py-12 max-w-2xl">
      <h1 className="font-serif text-2xl md:text-3xl tracking-tight mb-2">Settings</h1>
      <p className="text-sm text-fg-muted mb-8">Account and security</p>
      <SettingsForm email={profile.email} />
    </div>
  );
}
