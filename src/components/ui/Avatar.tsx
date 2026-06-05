import { cn, initials } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
};

export function Avatar({
  src,
  name,
  size = "md",
  className,
  ring = false,
}: {
  src?: string | null;
  name: string;
  size?: Size;
  className?: string;
  ring?: boolean;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover bg-bg-soft",
          sizes[size],
          ring && "ring-2 ring-accent ring-offset-2 ring-offset-bg",
          className
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-line flex items-center justify-center font-medium text-fg-muted",
        sizes[size],
        ring && "ring-2 ring-accent ring-offset-2 ring-offset-bg",
        className
      )}
      aria-label={name}
    >
      {initials(name) || "·"}
    </div>
  );
}
