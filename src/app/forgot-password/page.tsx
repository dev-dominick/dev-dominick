'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, InputWithIcon, Button } from '@/lib/ui'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Failed to send reset email')
            } else {
                setSubmitted(true)
                toast.success('Password reset link sent!')
            }
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                {/* Minimal header */}
                <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <Link href="/" className="flex items-center gap-2 font-bold text-white hover:text-blue-400 transition-colors">
                                <img src="/code-cloud-logo.svg" alt="Code Cloud" className="w-8 h-8" />
                                <span className="text-lg">Code Cloud</span>
                            </Link>
                            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                                Back to <span className="text-blue-400 font-medium">Sign in</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Background decorations */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
                    <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur border-slate-800">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-green-500/20 p-3">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-white">Check Your Email</CardTitle>
                            <CardDescription className="text-slate-400">
                                We've sent a password reset link to <span className="font-medium text-white">{email}</span>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                <p className="text-sm text-slate-300 mb-2">
                                    <strong>Didn't receive the email?</strong>
                                </p>
                                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                                    <li>Check your spam/junk folder</li>
                                    <li>Make sure you entered the correct email</li>
                                    <li>Wait a few minutes for the email to arrive</li>
                                </ul>
                            </div>

                            <Button
                                onClick={() => setSubmitted(false)}
                                variant="outline"
                                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                Try a different email
                            </Button>

                            <div className="text-center">
                                <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Minimal header */}
            <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 font-bold text-white hover:text-blue-400 transition-colors">
                            <img src="/code-cloud-logo.svg" alt="Code Cloud" className="w-8 h-8" />
                            <span className="text-lg">Code Cloud</span>
                        </Link>
                        <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                            Remember password? <span className="text-blue-400 font-medium">Sign in</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
                <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">Reset Your Password</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter your email address and we'll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputWithIcon
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                label="Email Address"
                                startIcon={<Mail className="w-5 h-5" />}
                                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
                            />

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>

                            <div className="text-center">
                                <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
