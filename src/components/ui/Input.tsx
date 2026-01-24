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
            "w-full rounded-lg border transition-all duration-200",
            "bg-white dark:bg-neutral-900",
            "text-neutral-900 dark:text-neutral-50",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",

            // Border color
            !error && !success && "border-neutral-200 dark:border-neutral-700",
            error && "border-danger-500 dark:border-danger-600",
            success && "border-success-500 dark:border-success-600",

            // Focus state (WCAG AAA compliant)
            "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-0",
            !error && !success && "focus:ring-sky-500 focus:border-sky-500",
            error && "focus:ring-danger-500 focus:border-danger-500",
            success && "focus:ring-success-500 focus:border-success-500",

            // Hover state
            !error && !success && "hover:border-neutral-300 dark:hover:border-neutral-600",

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
                            "text-sm font-semibold",
                            "text-neutral-700 dark:text-neutral-300",
                            error && "text-danger-600 dark:text-danger-500"
                        )}
                    >
                        {label}
                        {required && <span className="ml-1 text-danger-500">*</span>}
                    </label>
                )}

                <div className="relative flex items-center">
                    {Icon && (
                        <Icon className={twMerge(
                            "pointer-events-none absolute left-3 h-5 w-5",
                            error ? "text-danger-500 dark:text-danger-400" : "text-neutral-400 dark:text-neutral-500"
                        )} />
                    )}

                    <input
                        id={inputId}
                        ref={ref}
                        type={showPassword ? "text" : type}
                        className={inputClasses}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? errorId : hint ? hintId : undefined}
                        {...props}
                    />

                    {/* Right side icons */}
                    <div className="absolute right-3 flex items-center gap-2">
                        {showPasswordToggle && type === "password" && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
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
                            <AlertCircle className="h-5 w-5 text-danger-500 dark:text-danger-400 flex-shrink-0" />
                        )}

                        {success && (
                            <CheckCircle2 className="h-5 w-5 text-success-500 dark:text-success-400 flex-shrink-0" />
                        )}
                    </div>
                </div>

                {hint && !error && (
                    <p id={hintId} className="text-xs text-neutral-500 dark:text-neutral-400">
                        {hint}
                    </p>
                )}

                {error && (
                    <p id={errorId} className="text-xs font-medium text-danger-600 dark:text-danger-400 flex items-center gap-1">
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
        if (!pwd) return { score: 0, label: "" };

        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z\d]/.test(pwd)) score++;

        const levels = [
            { score: 0, label: "", color: "", barColor: "" },
            { score: 1, label: "Weak", color: "text-danger-500", barColor: "bg-danger-500" },
            { score: 2, label: "Fair", color: "text-warning-500", barColor: "bg-warning-500" },
            { score: 3, label: "Good", color: "text-warning-400", barColor: "bg-warning-400" },
            { score: 4, label: "Strong", color: "text-success-500", barColor: "bg-success-500" },
            { score: 5, label: "Very Strong", color: "text-success-600", barColor: "bg-success-600" },
        ];

        return levels[Math.min(score, 5)];
    };

    const strength = getStrength(password);

    if (!password || !strength.label) return null;

    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
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
            "w-full rounded-lg border transition-all duration-200 resize-none",
            "bg-white dark:bg-neutral-900",
            "text-neutral-900 dark:text-neutral-50",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
            "border-neutral-200 dark:border-neutral-700",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-950",
            // Error state
            error && "border-danger-500 dark:border-danger-500 focus:ring-danger-500/30",
            // Success state
            !error && success && "border-success-500 dark:border-success-500 focus:ring-success-500/30",
            // Normal focus
            !error && !success && "focus:ring-primary-500/30 focus:border-primary-500",
            // Sizes
            sizes[textareaSize],
            className
        );

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {label}
                        {required && <span className="text-danger-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    <textarea
                        id={textareaId}
                        ref={ref}
                        className={textareaClasses}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : hint ? hintId : undefined}
                        {...props}
                    />
                </div>

                {hint && !error && (
                    <p id={hintId} className="text-xs text-neutral-500 dark:text-neutral-400">
                        {hint}
                    </p>
                )}

                {error && (
                    <p id={errorId} className="text-xs font-medium text-danger-600 dark:text-danger-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";