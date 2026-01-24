import { type HTMLAttributes } from "react";

export interface SectionProps extends HTMLAttributes<HTMLDivElement> {}

export function Section({ className, ...props }: SectionProps) {
    const classes = ["py-12", className || ""].filter(Boolean).join(" ");
    return <div className={classes} {...props} />;
}
