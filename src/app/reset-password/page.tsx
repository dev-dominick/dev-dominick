'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, InputWithIcon, Button } from '@/lib/ui'
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
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                {/* Minimal header */}
                <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <Link href="/" className="flex items-center gap-2 font-bold text-white hover:text-blue-400 transition-colors">
                                <img src="/code-cloud-logo.svg" alt="Code Cloud" className="w-8 h-8" />
                                <span className="text-lg">Code Cloud</span>
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
                            <CardTitle className="text-2xl text-white">Password Reset Complete</CardTitle>
                            <CardDescription className="text-slate-400">
                                Your password has been successfully reset. Redirecting to login...
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Link href="/login">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors">
                                    Go to Sign In
                                </Button>
                            </Link>
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
                        <CardTitle className="text-2xl text-white">Create New Password</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter a new password for your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputWithIcon
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                label="New Password"
                                startIcon={<Lock className="w-5 h-5" />}
                                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
                            />

                            <InputWithIcon
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                label="Confirm Password"
                                startIcon={<Lock className="w-5 h-5" />}
                                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
                            />

                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                <p className="text-xs text-slate-300 mb-2"><strong>Password Requirements:</strong></p>
                                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                                    <li>At least 10 characters long</li>
                                    <li>At least one uppercase letter</li>
                                    <li>At least one lowercase letter</li>
                                    <li>At least one number</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
}
