'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui'
import { Sparkles, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AuthLanding() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })

    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()
    const next = searchParams.get('next') || '/dashboard'

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
            if (isLogin) {
                // Handle login
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                })

                if (result?.error) {
                    toast.error('Invalid email or password')
                } else {
                    toast.success('Welcome back!')
                    router.push(next)
                }
            } else {
                // Handle signup
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                })

                const data = await response.json()

                if (!response.ok) {
                    if (data.details && Array.isArray(data.details)) {
                        // Validation errors
                        data.details.forEach((err: { message: string }) => toast.error(err.message))
                    } else {
                        toast.error(data.error || 'Signup failed')
                    }
                } else {
                    toast.success('Account created! Signing you in...')

                    // Auto-login after signup
                    const result = await signIn('credentials', {
                        email: formData.email,
                        password: formData.password,
                        redirect: false,
                    })

                    if (result?.ok) {
                        router.push(next)
                    }
                }
            }
        } catch (error) {
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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Marketing content */}
                    <div className="text-white space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                                Welcome to Code Cloud
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Your Digital Business Platform
                        </h1>

                        <p className="text-xl text-slate-400">
                            Manage your business with enterprise-grade tools. Invoicing, analytics, appointments, and more.
                        </p>

                        <div className="space-y-4 pt-6">
                            {[
                                { icon: CheckCircle2, text: 'Professional invoicing and payments' },
                                { icon: CheckCircle2, text: 'Real-time business analytics' },
                                { icon: CheckCircle2, text: 'Appointment scheduling & management' },
                                { icon: CheckCircle2, text: 'Secure, encrypted data storage' },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <feature.icon className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-slate-300">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Auth form */}
                    <Card className="bg-slate-900/80 backdrop-blur border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                {isLogin
                                    ? 'Welcome back! Enter your credentials to continue.'
                                    : 'Get started with your free account today.'
                                }
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required={!isLogin}
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={isLogin ? '••••••••' : 'Min. 8 characters'}
                                        />
                                    </div>
                                    {!isLogin && (
                                        <p className="mt-1 text-xs text-slate-400">
                                            Must contain uppercase, lowercase, and number
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        'Please wait...'
                                    ) : (
                                        <>
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    {isLogin ? (
                                        <>
                                            Don't have an account?{' '}
                                            <span className="text-blue-400 font-medium">Sign up</span>
                                        </>
                                    ) : (
                                        <>
                                            Already have an account?{' '}
                                            <span className="text-blue-400 font-medium">Sign in</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
