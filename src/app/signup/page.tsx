'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, InputWithIcon } from '@/lib/ui'
import { Lock, Mail, User, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SignupPage() {
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          data.details.forEach((err: { message: string }) => toast.error(err.message))
        } else {
          toast.error(data.error || 'Signup failed')
        }
      } else {
        toast.success('Account created! Redirecting...')
        router.push(next)
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
      {/* Minimal header */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-white hover:text-blue-400 transition-colors">
              <img src="/code-cloud-logo.svg" alt="Code Cloud" className="w-8 h-8" />
              <span className="text-lg">Code Cloud</span>
            </Link>
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
              Already have an account? <span className="text-blue-400 font-medium">Sign in</span>
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
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Get started with your free account today.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputWithIcon
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                label="Full Name"
                startIcon={<User className="w-5 h-5" />}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
              />

              <InputWithIcon
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                label="Email Address"
                startIcon={<Mail className="w-5 h-5" />}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
              />

              <div>
                <InputWithIcon
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 10 characters"
                  label="Password"
                  startIcon={<Lock className="w-5 h-5" />}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Must contain uppercase, lowercase, number, and be at least 10 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Creating account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

