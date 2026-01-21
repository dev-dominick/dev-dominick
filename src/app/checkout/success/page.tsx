'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useEntitlements } from '@/hooks/useEntitlements'
import { usePolling } from '@/hooks/usePolling'
import { useApiError } from '@/hooks/useApiError'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { refresh, subscription } = useEntitlements()
    const { handleError } = useApiError()
    const [state, setState] = useState<'polling' | 'success' | 'timeout' | 'error'>('polling')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const handlePoll = async (): Promise<boolean> => {
        try {
            await refresh()
            // Check if subscription is now active
            if (subscription?.status === 'active') {
                return true
            }
            return false
        } catch (err) {
            const errorDetails = handleError(err)
            if (errorDetails.type === 'unauthorized') {
                setState('error')
                setErrorMessage('Your session expired. Please sign in and try again.')
                return true // Stop polling
            }
            // For other errors, continue polling (return false)
            return false
        }
    }

    const { isPolling } = usePolling(handlePoll, true, {
        maxAttempts: 30,
        initialDelay: 1000,
        maxDelay: 5000,
        onSuccess: () => {
            setState('success')
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        },
        onTimeout: () => {
            setState('timeout')
        },
    })

    const sessionId = searchParams.get('session_id')

    if (state === 'success') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-8 h-8 text-emerald-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
                    <p className="text-slate-400 mb-6">Your subscription is now active. Redirecting to dashboard...</p>
                </div>
            </div>
        )
    }

    if (state === 'timeout') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Taking a Bit Longer</h1>
                    <p className="text-slate-400 mb-8">
                        Your payment is being processed. This usually takes a few seconds. Please try refreshing or check your
                        email for confirmation.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Refresh Page
                        </button>
                        <Link
                            href="/contact"
                            className="block px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (state === 'error') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Session Expired</h1>
                    <p className="text-slate-400 mb-8">{errorMessage}</p>
                    <Link
                        href="/signin"
                        className="inline-block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    // Polling state
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Activating Your Subscription</h1>
                <p className="text-slate-400">
                    Please wait while we process your payment and set up your account. This usually takes a few seconds.
                </p>
                {sessionId && <p className="text-xs text-slate-500 mt-4">Session: {sessionId}</p>}
            </div>
        </div>
    )
}
