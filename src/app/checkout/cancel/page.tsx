'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CheckoutCancelPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-warning-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-8 h-8 text-warning-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Payment Canceled</h1>
                <p className="text-neutral-400 mb-8">
                    Your checkout was cancelled. No charges have been made. You can try again or contact us for support.
                </p>
                <div className="space-y-3">
                    <Link
                        href="/pricing"
                        className="block px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Back to Pricing
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                    <Link
                        href="/contact"
                        className="block px-4 py-3 text-sky-400 hover:text-sky-300 font-medium"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    )
}
