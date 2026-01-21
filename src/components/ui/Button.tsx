"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
}

function baseClasses(variant: ButtonProps["variant"], size: ButtonProps["size"]) {
    const common = "inline-flex items-center justify-center rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-matrix-border font-medium font-mono";
    const variants = {
        primary: "bg-matrix-primary text-matrix-black hover:bg-matrix-secondary hover:shadow-matrix border border-matrix-primary",
        secondary: "bg-matrix-dark text-matrix-text-primary border border-matrix-border hover:bg-matrix-gray hover:shadow-matrix",
        ghost: "bg-transparent text-matrix-text-primary hover:bg-matrix-dark hover:text-matrix-primary border border-transparent hover:border-matrix-muted",
    } as const;
    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
    } as const;
    return twMerge(common, variants[variant || "primary"], sizes[size || "md"]);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant, size, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={twMerge(baseClasses(variant, size), className)}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
