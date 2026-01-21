'use client'

import Link from 'next/link'

interface UpgradePromptProps {
    message?: string
}

export default function UpgradePrompt({
    message = 'This feature requires a subscription. Upgrade to get started.',
}: UpgradePromptProps) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Upgrade Required</h1>
                <p className="text-slate-400 mb-8">{message}</p>
                <Link
                    href="/pricing"
                    className="w-full inline-block px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    View Plans
                </Link>
            </div>
        </div>
    )
}
