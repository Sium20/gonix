import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Users, Building2, ScrollText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!isAdmin((session.user as any).role)) redirect("/dashboard");

  return (
    <div className="border-t border-line bg-bg-soft/30">
      <div className="container-page py-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <h1 className="text-lg font-semibold">Admin</h1>
          <Badge variant="gold" className="ml-2">{(session.user as any).role}</Badge>
        </div>
        <div className="grid lg:grid-cols-[200px_1fr] gap-8">
          <AdminNav />
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

function AdminNav() {
  const items = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/universities", label: "Universities", icon: Building2 },
  ];
  return (
    <nav className="space-y-1 lg:sticky lg:top-20">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-fg-muted hover:text-fg hover:bg-fg/5 transition-colors"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
