import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-surface-50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-sky focus-visible:border-accent-sky",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-accent-rose focus-visible:ring-accent-rose" : "border-white/10 hover:border-white/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-accent-rose">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
