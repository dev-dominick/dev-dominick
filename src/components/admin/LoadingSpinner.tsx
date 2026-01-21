'use client';

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

/**
 * Reusable loading spinner component
 */
export function LoadingSpinner({
    size = 'medium',
    text = 'Loading...',
    fullScreen = false,
    className = '',
}: LoadingSpinnerProps) {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
            <div
                className={`${sizeClasses[size]} border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            />
            {text && <p className="text-gray-600 text-sm">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
}
