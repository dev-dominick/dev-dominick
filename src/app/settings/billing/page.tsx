'use client'

import PrivateRoute from '@/components/PrivateRoute'
import { useEntitlements } from '@/hooks/useEntitlements'
import { useApiError } from '@/hooks/useApiError'
import { useState } from 'react'
import Link from 'next/link'

export default function BillingPage() {
    const { subscription, user } = useEntitlements()
    const { showError } = useApiError()
    const [loading, setLoading] = useState(false)

    const handleManageSubscription = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/billing/portal-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                throw new Response(`Portal failed: ${response.status}`, { status: response.status })
            }

            const { portalUrl } = await response.json()
            if (portalUrl) {
                window.location.href = portalUrl
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <PrivateRoute>
            <div className="min-h-screen bg-slate-950 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-white mb-2">Billing & Subscription</h1>
                        <p className="text-slate-400">Manage your subscription and billing information</p>
                    </div>

                    {/* Subscription Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Current Plan</h2>

                        {subscription ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-slate-400 text-sm">Plan Name</label>
                                        <p className="text-white font-medium text-lg">{subscription.planName || 'Premium Plan'}</p>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm">Status</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div
                                                className={`w-2 h-2 rounded-full ${subscription.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                                                    }`}
                                            ></div>
                                            <p className={`font-medium capitalize ${subscription.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                                                }`}>
                                                {subscription.status}
                                            </p>
                                        </div>
                                    </div>
                                    {subscription.currentPeriodEnd && (
                                        <div>
                                            <label className="text-slate-400 text-sm">Next Billing Date</label>
                                            <p className="text-white font-medium text-lg">
                                                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-slate-400 text-sm">Subscription ID</label>
                                        <p className="text-white font-mono text-sm">{subscription.id}</p>
                                    </div>
                                </div>

                                {subscription.status === 'past_due' && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                        <p className="text-amber-200">
                                            Your subscription payment failed. Please update your billing information to continue enjoying your
                                            plan.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-6 border-t border-slate-800">
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Loading...' : 'Manage Subscription'}
                                    </button>
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Back to Dashboard
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400 mb-4">You don't have an active subscription yet.</p>
                                <Link
                                    href="/pricing"
                                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    View Plans
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Billing Information */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Billing Contact</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm">Email</label>
                                <p className="text-white font-medium mt-1">{user?.email}</p>
                            </div>
                            {user?.name && (
                                <div>
                                    <label className="text-slate-400 text-sm">Name</label>
                                    <p className="text-white font-medium mt-1">{user.name}</p>
                                </div>
                            )}
                            <p className="text-slate-400 text-sm mt-4">
                                To update your billing address or payment method, please use the Stripe Portal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PrivateRoute>
    )
}
