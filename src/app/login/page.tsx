'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [startTime] = useState(Date.now())

    const router = useRouter()
    const searchParams = useSearchParams()
    const { status } = useSession()

    // Fix default redirect from /dashboard to /app
    const nextParam = searchParams.get('next')
    const next = nextParam && nextParam.startsWith('/') ? nextParam : '/app'

    // Redirect if already authenticated
    useEffect(() => {
        if (status === 'authenticated') {
            router.push(next)
        }
    }, [status, router, next])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted')
        setLoading(true)

        // Bot detection: form should take at least 2 seconds to fill (disabled in dev)
        if (process.env.NODE_ENV === 'production') {
            const timeTaken = Date.now() - startTime
            if (timeTaken < 2000) {
                toast.error('Please slow down')
                setLoading(false)
                return
            }
        }

        try {
            console.log('Calling signIn with:', { email: formData.email, password: '***' })
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            console.log('signIn result:', result)

            if (result?.error) {
                console.error('Login error:', result.error)
                toast.error(result.error || 'Login failed')
            } else if (result?.ok) {
                toast.success('Welcome back!')
                router.refresh()
                router.push(next)
            } else {
                console.warn('Unexpected signIn response:', result)
                toast.error('Login failed - unexpected response')
            }
        } catch (err) {
            console.error('Login exception:', err)
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

    if (status === 'loading' || status === 'authenticated') {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-pulse text-primary-400">Loading...</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.06),transparent_30%)]" />

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
                <Card className="w-full max-w-md border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-xl">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-heading-lg text-neutral-50">Sign In</CardTitle>
                        <CardDescription className="text-neutral-400 text-body-sm">
                            Welcome back. Enter your credentials to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                label="Email Address"
                                icon={Mail}
                                autoComplete="email"
                            />

                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                label="Password"
                                icon={Lock}
                                autoComplete="current-password"
                                showPasswordToggle
                            />

                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-sm font-semibold text-primary-300 hover:text-primary-200 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                size="lg"
                            >
                                {loading ? (
                                    'Signing you in...'
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>

                            <p className="text-center text-sm text-neutral-400">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="text-primary-300 hover:text-primary-200 font-semibold">
                                    Create one
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
