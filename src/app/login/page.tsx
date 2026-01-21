'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input, Button } from '@/components/ui'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

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
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (result?.error) {
                toast.error(result.error)
            } else if (result?.ok) {
                toast.success('Welcome back!')
                router.refresh()
                router.push(next)
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

    if (status === 'loading' || status === 'authenticated') {
        return (
            <div className="min-h-screen bg-matrix-black flex items-center justify-center">
                <div className="animate-pulse text-matrix-primary font-mono">Loading...</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-matrix-black">
            {/* Minimal header */}
            <nav className="border-b border-matrix-border/20 bg-matrix-black/95 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 font-bold text-matrix-text-primary hover:text-matrix-primary transition-colors font-mono">
                            <img src="/code-cloud-logo.svg" alt="dev-dominick" className="w-8 h-8" />
                            <span className="text-lg">dev-dominick</span>
                        </Link>
                        <Link href="/signup" className="text-sm text-matrix-text-secondary hover:text-matrix-text-primary transition-colors font-mono">
                            Need an account? <span className="text-matrix-primary font-medium">Sign up</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Matrix grid background */}
            <div className="fixed inset-0 pointer-events-none opacity-10">
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
                <div className="w-full max-w-md p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker shadow-matrix-lg">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-matrix-text-primary font-mono">Sign In</h1>
                        <p className="text-matrix-text-secondary mt-1">
                            Welcome back! Enter your credentials to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            label="Email Address"
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
                        />

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-matrix-primary hover:text-matrix-secondary transition-colors font-mono">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                'Please wait...'
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    )
}
