import { type HTMLAttributes } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function Container({ className, ...props }: ContainerProps) {
    const classes = [
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
        className || "",
    ]
        .filter(Boolean)
        .join(" ");
    return <div className={classes} {...props} />;
}
