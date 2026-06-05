import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  // Dark ink CTA on cream — high contrast, "old school stamp"
  primary:
    "bg-fg text-bg border border-fg hover:bg-transparent hover:text-fg disabled:opacity-50",
  // Outlined — dark text, inverts to dark fill on hover
  secondary:
    "bg-transparent text-fg border border-fg/20 hover:bg-fg hover:text-bg disabled:opacity-50",
  // Minimal outline
  outline:
    "bg-transparent text-fg border border-fg/15 hover:border-fg/40 disabled:opacity-50",
  // Text only
  ghost:
    "bg-transparent text-fg border border-transparent hover:bg-fg/5 disabled:opacity-50",
  // Danger (oxblood on cream)
  danger:
    "bg-danger text-bg border border-danger hover:bg-danger/90 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 ease-in-out select-none",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg/40 focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
          "disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
