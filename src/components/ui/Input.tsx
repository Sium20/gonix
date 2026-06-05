import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md bg-bg-soft border border-line px-3 text-sm text-fg placeholder:text-fg-dim",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:border-fg/60 focus:bg-bg",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full rounded-md bg-bg-soft border border-line p-3 text-sm text-fg placeholder:text-fg-dim",
        "transition-all duration-200 ease-in-out resize-y",
        "focus:outline-none focus:border-fg/60 focus:bg-bg",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md bg-bg-soft border border-line px-3 text-sm text-fg",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:border-fg/60 focus:bg-bg",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-xs font-medium text-fg-muted uppercase tracking-wide", className)} {...props} />
  )
);
Label.displayName = "Label";

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-xs text-danger mt-1">{children}</p>;
}
