"use client";

import { type InputHTMLAttributes, type ComponentType, forwardRef, useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
    success?: boolean;
    inputSize?: "sm" | "md" | "lg";
    required?: boolean;
    showPasswordToggle?: boolean;
    icon?: ComponentType<{ className?: string }>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            hint,
            error,
            success,
            inputSize = "md",
            required,
            showPasswordToggle,
            icon: Icon,
            className,
            type = "text",
            ...props
        },
        ref
    ) => {
        const inputId = useId();
        const errorId = useId();
        const hintId = useId();
        const [showPassword, setShowPassword] = useState(false);

        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-11 px-4 text-base",
        } as const;

        const inputClasses = twMerge(
            // Base styles
            "w-full rounded-[var(--radius-md)] border transition-all duration-150 ease-out",
            "bg-[var(--surface-input)]",
            "text-[var(--text-primary)]",
            "placeholder:text-[var(--text-muted)]",

            // Border color
            !error && !success && "border-[var(--border-default)]",
            error && "border-[var(--error)]",
            success && "border-[var(--success)]",

            // Focus state
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface-base)]",
            !error && !success && "focus:ring-[var(--accent)] focus:border-[var(--accent)]",
            error && "focus:ring-[var(--error)] focus:border-[var(--error)]",
            success && "focus:ring-[var(--success)] focus:border-[var(--success)]",

            // Hover state
            !error && !success && "hover:border-[var(--border-strong)]",

            // Base padding with left padding for icons
            (Icon || showPasswordToggle || error || success) && "pl-9",
            sizes[inputSize],

            className
        );

        return (
            <div className="flex flex-col gap-2">
                {label && (
                    <label
                        htmlFor={inputId}
                        className={twMerge(
                            "text-sm font-medium",
                            "text-[var(--text-secondary)]",
                            error && "text-[var(--error)]"
                        )}
                    >
                        {label}
                        {required && <span className="ml-1 text-[var(--error)]">*</span>}
                    </label>
                )}

                <div className="relative flex items-center">
                    {Icon && (
                        <Icon className={twMerge(
                            "pointer-events-none absolute left-3 h-5 w-5",
                            error ? "text-[var(--error)]" : "text-[var(--text-muted)]"
                        )} />
                    )}

                    <input
                        id={inputId}
                        ref={ref}
                        type={showPassword ? "text" : type}
                        className={inputClasses}
                        aria-describedby={error ? errorId : hint ? hintId : undefined}
                        {...props}
                    />

                    {/* Right side icons */}
                    <div className="absolute right-3 flex items-center gap-2">
                        {showPasswordToggle && type === "password" && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        )}

                        {error && (
                            <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0" />
                        )}

                        {success && (
                            <CheckCircle2 className="h-5 w-5 text-[var(--success)] flex-shrink-0" />
                        )}
                    </div>
                </div>

                {hint && !error && (
                    <p id={hintId} className="text-xs text-[var(--text-muted)]">
                        {hint}
                    </p>
                )}

                {error && (
                    <p id={errorId} className="text-xs font-medium text-[var(--error)] flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

// Password strength indicator component
export interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const getStrength = (pwd: string) => {
        const levels = [
            { score: 0, label: "", color: "", barColor: "" },
            { score: 1, label: "Weak", color: "text-[var(--error)]", barColor: "bg-[var(--error)]" },
            { score: 2, label: "Fair", color: "text-[var(--warning)]", barColor: "bg-[var(--warning)]" },
            { score: 3, label: "Good", color: "text-[var(--warning)]", barColor: "bg-[var(--warning)]" },
            { score: 4, label: "Strong", color: "text-[var(--success)]", barColor: "bg-[var(--success)]" },
            { score: 5, label: "Very Strong", color: "text-[var(--success)]", barColor: "bg-[var(--success)]" },
        ];

        if (!pwd) return levels[0];

        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z\d]/.test(pwd)) score++;

        return levels[Math.min(score, 5)];
    };

    const strength = getStrength(password);

    if (!password || !strength.label) return null;

    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
                <div
                    className={twMerge(
                        "h-full rounded-full transition-all duration-300",
                        strength.barColor
                    )}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                />
            </div>
            <span className={twMerge("text-xs font-medium", strength.color)}>
                {strength.label}
            </span>
        </div>
    );
}

export interface InputWithIconProps extends InputProps {
    icon?: ComponentType<{ className?: string }>;
}

export function InputWithIcon({ icon: Icon, className, ...props }: InputWithIconProps) {
    return <Input icon={Icon} className={className} {...props} />;
}

export function Calendar(props: InputHTMLAttributes<HTMLInputElement>) {
    return <Input type="date" {...props} />;
}
// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
    error?: string;
    success?: boolean;
    textareaSize?: "sm" | "md" | "lg";
    required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            hint,
            error,
            success,
            textareaSize = "md",
            required,
            className,
            ...props
        },
        ref
    ) => {
        const textareaId = useId();
        const errorId = useId();
        const hintId = useId();

        const sizes = {
            sm: "px-3 py-2 text-sm min-h-20",
            md: "px-4 py-3 text-sm min-h-28",
            lg: "px-4 py-3 text-base min-h-40",
        } as const;

        const textareaClasses = twMerge(
            // Base styles
            "w-full rounded-[var(--radius-md)] border transition-all duration-150 ease-out resize-none",
            "bg-[var(--surface-input)]",
            "text-[var(--text-primary)]",
            "placeholder:text-[var(--text-muted)]",
            "border-[var(--border-default)]",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface-base)]",
            // Error state
            error && "border-[var(--error)] focus:ring-[var(--error)]",
            // Success state
            !error && success && "border-[var(--success)] focus:ring-[var(--success)]",
            // Normal focus
            !error && !success && "focus:ring-[var(--accent)] focus:border-[var(--accent)]",
            // Hover
            !error && !success && "hover:border-[var(--border-strong)]",
            // Sizes
            sizes[textareaSize],
            className
        );

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--text-secondary)]">
                        {label}
                        {required && <span className="text-[var(--error)] ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    <textarea
                        id={textareaId}
                        ref={ref}
                        className={textareaClasses}
                        aria-describedby={error ? errorId : hint ? hintId : undefined}
                        {...props}
                    />
                </div>

                {hint && !error && (
                    <p id={hintId} className="text-xs text-[var(--text-muted)]">
                        {hint}
                    </p>
                )}

                {error && (
                    <p id={errorId} className="text-xs font-medium text-[var(--error)] flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";