import Link from "next/link";
import { Check, GraduationCap, Briefcase, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/utils";

const ROLES = [
  {
    id: "student",
    icon: GraduationCap,
    proofItems: ["University-issued Student ID", "Photo of Student ID card", "Optional: institutional email"],
  },
  {
    id: "teacher",
    icon: Briefcase,
    proofItems: ["Faculty ID number", "Photo of Faculty ID card", "Institutional email (required)"],
  },
  {
    id: "alumni",
    icon: Award,
    proofItems: ["Graduation year + last student ID", "Photo of degree certificate or final ID", "Current work info (optional)"],
  },
] as const;

export function RoleChooser({ activeRole }: { activeRole?: string }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {ROLES.map((r) => {
        const Icon = r.icon;
        const isActive = activeRole === r.id;
        return (
          <Link
            key={r.id}
            href={`/register/${r.id}`}
            className={cn(
              "block group rounded-xl border border-line bg-bg-soft p-6 transition-all duration-200 ease-in-out",
              "hover:border-accent/40 hover:bg-bg-card hover:-translate-y-0.5",
              isActive && "border-accent bg-bg-card"
            )}
          >
            <div className="h-11 w-11 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{ROLE_LABELS[r.id]}</h3>
            <p className="text-sm text-fg-muted mb-4">{ROLE_DESCRIPTIONS[r.id]}</p>
            <ul className="space-y-1.5">
              {r.proofItems.map((it) => (
                <li key={it} className="text-xs text-fg-muted flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-accent mt-4 group-hover:underline">Continue →</p>
          </Link>
        );
      })}
    </div>
  );
}
