'use client';

import React from 'react';

interface DataViewProps<T> {
    data: T[] | null;
    loading: boolean;
    error: string;
    emptyMessage?: string;
    loadingComponent?: React.ReactNode;
    errorComponent?: (error: string) => React.ReactNode;
    children: (item: T) => React.ReactNode;
}

/**
 * Reusable component for displaying lists of data
 * Handles loading, error, and empty states
 */
export function DataView<T extends { id: string | number }>({
    data,
    loading,
    error,
    emptyMessage = 'No data found',
    loadingComponent,
    errorComponent,
    children,
}: DataViewProps<T>) {
    if (loading) {
        return (
            loadingComponent || (
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">Loading...</div>
                </div>
            )
        );
    }

    if (error) {
        return (
            errorComponent?.(error) || (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">Error: {error}</div>
                </div>
            )
        );
    }

    if (!data?.length) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-400">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {data.map(item => (
                <div key={item.id}>{children(item)}</div>
            ))}
        </div>
    );
}
