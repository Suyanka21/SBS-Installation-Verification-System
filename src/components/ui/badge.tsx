import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-100 text-slate-300 border-white/10",
    success: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-accent-rose/10 text-accent-rose border-accent-rose/20",
    outline: "bg-transparent text-slate-300 border-white/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
