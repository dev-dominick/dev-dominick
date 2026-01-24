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
    const baseClasses = "rounded-xl transition-all duration-200";

    const variants = {
        elevated: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-lg",
        outlined: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700",
        flat: "bg-neutral-50 dark:bg-neutral-800 border-0",
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
                "border-b border-neutral-200 dark:border-neutral-800 px-6 py-4",
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
                    "text-xl font-semibold text-neutral-900 dark:text-neutral-50",
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
                    "text-sm text-neutral-600 dark:text-neutral-400",
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
