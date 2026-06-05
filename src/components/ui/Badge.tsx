import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "gold" | "success" | "warning" | "danger" | "muted" | "info";
};

const variants = {
  default: "bg-fg/5 text-fg border-fg/10",
  gold: "bg-accent/10 text-accent border-accent/25",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-red-100 text-danger border-red-200",
  muted: "bg-fg/5 text-fg-muted border-fg/5",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
