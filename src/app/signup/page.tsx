'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Lock, Mail, User, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  // Bot protection
  const [honeypot, setHoneypot] = useState('')
  const [startTime] = useState(Date.now())

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

    // Bot detection: honeypot field should be empty
    if (honeypot) {
      setLoading(false)
      return
    }

    // Bot detection: form should take at least 3 seconds to fill
    const timeTaken = Date.now() - startTime
    if (timeTaken < 3000) {
      toast.error('Please take your time filling out the form')
      setLoading(false)
      return
    }

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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse text-primary-400">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-slate-950 to-neutral-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.06),transparent_30%)]" />

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <Card className="w-full max-w-md border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-heading-lg text-neutral-50">Create Account</CardTitle>
            <CardDescription className="text-neutral-400 text-body-sm">
              Get started with your free account today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot field - hidden from real users */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                label="Full Name"
                icon={User}
                autoComplete="name"
              />

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
                hint="Must contain uppercase, lowercase, number, and be at least 10 characters"
                showPasswordToggle
                autoComplete="new-password"
              />

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                size="lg"
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

              <p className="text-center text-sm text-neutral-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-300 hover:text-primary-200 font-semibold">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

