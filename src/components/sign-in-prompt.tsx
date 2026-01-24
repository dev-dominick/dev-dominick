'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function SignInPrompt() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Sign In Required</h1>
                <p className="text-slate-400 mb-8">
                    You need to be signed in to access this feature.
                </p>
                <button
                    onClick={() => signIn()}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-4"
                >
                    Sign In
                </button>
                <p className="text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
