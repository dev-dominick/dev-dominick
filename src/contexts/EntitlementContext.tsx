'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export interface Subscription {
    id: string
    status: 'active' | 'past_due' | 'canceled' | 'pending'
    planId: string
    currentPeriodEnd: string
    planName?: string
}

export interface Entitlements {
    investing: boolean
    trading: boolean
    [key: string]: boolean
}

export interface User {
    id: string
    email: string
    name?: string
}

export interface EntitlementContextType {
    user: User | null
    subscription: Subscription | null
    entitlements: Entitlements | null
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
    isAuthenticated: boolean
}

export const EntitlementContext = createContext<EntitlementContextType | undefined>(undefined)

interface EntitlementProviderProps {
    children: React.ReactNode
}

export function EntitlementProvider({ children }: EntitlementProviderProps) {
    const { data: session } = useSession()
    const [state, setState] = useState<Omit<EntitlementContextType, 'refresh' | 'isAuthenticated'>>({
        user: null,
        subscription: null,
        entitlements: null,
        isLoading: true,
        error: null,
    })

    const refresh = useCallback(async () => {
        if (!session) {
            setState(prev => ({ ...prev, isLoading: false, error: null }))
            return
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const response = await fetch('/api/me', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            if (response.status === 401) {
                setState(prev => ({
                    ...prev,
                    user: null,
                    subscription: null,
                    entitlements: null,
                    isLoading: false,
                    error: 'Unauthorized',
                }))
                return
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch entitlements: ${response.status}`)
            }

            const data = await response.json()

            setState({
                user: data.user || null,
                subscription: data.subscription || null,
                entitlements: data.entitlements || {},
                isLoading: false,
                error: null,
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load entitlements'
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: message,
            }))
        }
    }, [session])

    // Fetch on mount and when session changes
    useEffect(() => {
        refresh()
    }, [session, refresh])

    const value: EntitlementContextType = {
        ...state,
        refresh,
        isAuthenticated: !!session?.user,
    }

    return (
        <EntitlementContext.Provider value={value}>
            {children}
        </EntitlementContext.Provider>
    )
}
