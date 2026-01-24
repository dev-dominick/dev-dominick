'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button } from '@/components/ui'
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
            <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.06),transparent_30%)]" />

                <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
                    <Card className="w-full max-w-md border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-xl">
                        <CardHeader className="text-center space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/15">
                                <CheckCircle2 className="w-7 h-7 text-primary-300" />
                            </div>
                            <CardTitle className="text-heading-md text-neutral-50">Check your email</CardTitle>
                            <CardDescription className="text-neutral-400">
                                We sent a reset link to <span className="font-semibold text-neutral-100">{email}</span>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                                <p className="text-sm text-neutral-100 mb-2 font-semibold">Didn't get it?</p>
                                <ul className="text-sm text-neutral-400 space-y-1 list-disc list-inside">
                                    <li>Check spam or promotions</li>
                                    <li>Verify the email address</li>
                                    <li>Wait a couple of minutes</li>
                                </ul>
                            </div>

                            <Button
                                onClick={() => setSubmitted(false)}
                                variant="secondary"
                                fullWidth
                            >
                                Try a different email
                            </Button>

                            <div className="text-center">
                                <Link href="/login" className="text-sm text-primary-300 hover:text-primary-200 inline-flex items-center gap-1 font-semibold">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.06),transparent_30%)]" />

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
                <Card className="w-full max-w-md border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-xl">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-heading-lg text-neutral-50">Reset your password</CardTitle>
                        <CardDescription className="text-neutral-400 text-body-sm">
                            Enter your email and we’ll send you a secure reset link.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                label="Email Address"
                                icon={Mail}
                                autoComplete="email"
                            />

                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                size="lg"
                            >
                                {loading ? 'Sending...' : 'Send reset link'}
                            </Button>

                            <div className="text-center">
                                <Link href="/login" className="text-sm text-primary-300 hover:text-primary-200 inline-flex items-center gap-1 font-semibold">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to sign in
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
