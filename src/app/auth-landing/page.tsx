'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { AuthForm } from '@/components/auth/AuthForm'

export default function AuthLandingPage() {
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
        <AuthLayout
            eyebrow="Welcome to Code Cloud"
            eyebrowIcon={<Sparkles className="w-6 h-6 text-blue-400" />}
            title="Your Digital Business Platform"
            subtitle="Manage your business with enterprise-grade tools. Invoicing, analytics, appointments, and more."
            features={[
                { icon: <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />, text: 'Professional invoicing and payments' },
                { icon: <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />, text: 'Real-time business analytics' },
                { icon: <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />, text: 'Appointment scheduling & management' },
                { icon: <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />, text: 'Secure, encrypted data storage' },
            ]}
            formTitle={isLogin ? 'Sign In' : 'Create Account'}
            formDescription={isLogin
                ? 'Welcome back! Enter your credentials to continue.'
                : 'Get started with your free account today.'
            }
        >
            <AuthForm
                isLogin={isLogin}
                loading={loading}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onToggleMode={() => setIsLogin(!isLogin)}
            />
        </AuthLayout>
    )
}
