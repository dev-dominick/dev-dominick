'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button } from '@/components/ui'
import { Lock, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

function ResetPasswordContent() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    })
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token')
            router.push('/forgot-password')
        }
    }, [token, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 10) {
            toast.error('Password must be at least 10 characters')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Failed to reset password')
            } else {
                setSuccess(true)
                toast.success('Password reset successfully!')
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            }
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    if (success) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.06),transparent_30%)]" />

                <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
                    <Card className="w-full max-w-md border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-xl">
                        <CardHeader className="text-center space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/15">
                                <CheckCircle2 className="w-7 h-7 text-primary-300" />
                            </div>
                            <CardTitle className="text-heading-md text-neutral-50">Password reset complete</CardTitle>
                            <CardDescription className="text-neutral-400">
                                Your password was updated. Redirecting to sign in.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Link href="/login">
                                <Button fullWidth>
                                    Go to sign in
                                </Button>
                            </Link>
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
                        <CardTitle className="text-heading-lg text-neutral-50">Create a new password</CardTitle>
                        <CardDescription className="text-neutral-400 text-body-sm">
                            Secure your account with a strong password.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                label="New password"
                                icon={Lock}
                                showPasswordToggle
                                autoComplete="new-password"
                            />

                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                label="Confirm password"
                                icon={Lock}
                                showPasswordToggle
                                autoComplete="new-password"
                            />

                            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                                <p className="text-xs text-neutral-100 mb-2 font-semibold">Password requirements</p>
                                <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                                    <li>At least 10 characters</li>
                                    <li>Uppercase and lowercase letters</li>
                                    <li>At least one number</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                size="lg"
                            >
                                {loading ? 'Resetting...' : 'Reset password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 flex items-center justify-center">
                <div className="animate-pulse text-neutral-400">Loading...</div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
}
