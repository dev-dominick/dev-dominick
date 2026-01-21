import { type HTMLAttributes, type ElementType } from "react";

export interface CardProps extends HTMLAttributes<HTMLElement> {
    as?: ElementType;
}

export function Card({ as: Tag = "div", className, ...props }: CardProps) {
    const classes = [
        "rounded-lg border border-matrix-border/20 bg-matrix-darker shadow-lg",
        "hover:border-matrix-border/40 hover:shadow-matrix transition-all duration-300",
        className || "",
    ]
        .filter(Boolean)
        .join(" ");
    return <Tag className={classes} {...props} />;
}
