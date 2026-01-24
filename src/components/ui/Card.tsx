import { type HTMLAttributes, type ElementType } from "react";
import { twMerge } from "tailwind-merge";

export interface CardProps extends HTMLAttributes<HTMLElement> {
    as?: ElementType;
    variant?: "elevated" | "outlined" | "flat";
}

export function Card({
    as: Tag = "div",
    className,
    variant = "outlined",
    ...props
}: CardProps) {
    const baseClasses = [
        "rounded-[var(--radius-lg)]",
        "transition-all duration-150 ease-out",
    ].join(" ");

    const variants = {
        elevated: [
            "bg-[var(--surface-raised)]",
            "border border-[var(--border-subtle)]",
            "shadow-[var(--shadow-md)]",
            "hover:shadow-[var(--shadow-lg)]",
            "hover:border-[var(--border-default)]",
        ].join(" "),
        outlined: [
            "bg-[var(--surface-raised)]",
            "border border-[var(--border-subtle)]",
            "hover:border-[var(--border-default)]",
        ].join(" "),
        flat: [
            "bg-[var(--surface-overlay)]",
            "border-0",
        ].join(" "),
    };

    return (
        <Tag
            className={twMerge(baseClasses, variants[variant], className)}
            {...props}
        />
    );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
    return (
        <div
            className={twMerge(
                "border-b border-[var(--border-subtle)] px-6 py-4",
                className
            )}
            {...props}
        />
    );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
    return (
        <h2
            className={twMerge(
                "text-xl font-semibold text-[var(--text-primary)]",
                className
            )}
            {...props}
        />
    );
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
    return (
        <p
            className={twMerge(
                "text-sm text-[var(--text-secondary)]",
                className
            )}
            {...props}
        />
    );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
    return (
        <div
            className={twMerge("px-6 py-4", className)}
            {...props}
        />
    );
}
