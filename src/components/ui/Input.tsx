"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
    inputSize?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, hint, error, inputSize = "md", className, ...props }, ref) => {
        const inputId = useId();
        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-11 px-4 text-base",
        } as const;

        const inputClasses = twMerge(
            "w-full rounded-md border border-matrix-border/30 bg-matrix-dark text-matrix-text-primary placeholder:text-matrix-text-muted focus:outline-none focus:ring-2 focus:ring-matrix-border focus:border-matrix-primary transition-all duration-200 font-mono",
            sizes[inputSize],
            error ? "border-matrix-error focus:ring-matrix-error" : "",
            className
        );

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-matrix-text-secondary font-mono">
                        {label}
                    </label>
                )}
                <input id={inputId} ref={ref} className={inputClasses} {...props} />
                {hint && !error && (
                    <p className="text-xs text-matrix-text-muted">{hint}</p>
                )}
                {error && <p className="text-xs text-matrix-error font-mono">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
