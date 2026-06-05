import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] bg-[length:400px_100%] animate-shimmer",
        className
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-line rounded-xl bg-bg-soft/30">
      {icon ? <div className="mb-4 text-fg-dim">{icon}</div> : null}
      <h3 className="text-base font-medium text-fg">{title}</h3>
      {description ? <p className="text-sm text-fg-muted mt-1 max-w-md">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
