'use client';

import React from 'react';

interface FormErrorProps {
    error: string;
    fieldErrors?: Record<string, string>;
    onDismiss?: () => void;
    className?: string;
}

/**
 * Reusable component for displaying form errors
 */
export function FormError({
    error,
    fieldErrors = {},
    onDismiss,
    className = '',
}: FormErrorProps) {
    if (!error && Object.keys(fieldErrors).length === 0) {
        return null;
    }

    const hasFieldErrors = Object.keys(fieldErrors).length > 0;

    return (
        <div
            className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}
            role="alert"
        >
            {error && <div className="text-red-800 font-semibold mb-2">{error}</div>}

            {hasFieldErrors && (
                <ul className="text-red-700 text-sm space-y-1">
                    {Object.entries(fieldErrors).map(([field, message]) => (
                        <li key={field} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>
                                <strong>{field}:</strong> {message}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="mt-3 text-red-600 hover:text-red-800 text-sm font-semibold"
                    type="button"
                >
                    Dismiss
                </button>
            )}
        </div>
    );
}
