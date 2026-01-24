/**
 * SSR Safety Component: ClientOnly
 * 
 * Renders children only after client-side hydration is complete.
 * Shows a fallback (or nothing) during SSR and initial client render.
 * 
 * Use this to wrap components that:
 * - Access window / document / localStorage / sessionStorage
 * - Use Date.now() / Math.random() / toLocaleString() in render
 * - Depend on browser APIs not available during SSR
 * 
 * @example
 * ```tsx
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <ComponentThatUsesLocalStorage />
 * </ClientOnly>
 * ```
 * 
 * @example Dynamic timestamp
 * ```tsx
 * <ClientOnly>
 *   <div>{new Date().toLocaleString()}</div>
 * </ClientOnly>
 * ```
 * 
 * ⚠️ IMPORTANT: This component prevents hydration mismatches by ensuring
 * server and initial client render return the same fallback.
 */

'use client';

import { ReactNode } from 'react';
import { useMounted } from './useMounted';

interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const mounted = useMounted();

    if (!mounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
