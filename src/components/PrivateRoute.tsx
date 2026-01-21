'use client'

import { useEntitlements } from '@/hooks/useEntitlements'
import { ReactNode } from 'react'
import SignInPrompt from './SignInPrompt'

interface PrivateRouteProps {
    children: ReactNode
    fallback?: ReactNode
}

export default function PrivateRoute({ children, fallback }: PrivateRouteProps) {
    const { isAuthenticated, isLoading } = useEntitlements()

    if (isLoading) {
        return fallback || (
            <div className="flex items-center justify-center p-8">
                <div className="text-slate-400">Loading...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <SignInPrompt />
    }

    return <>{children}</>
}
