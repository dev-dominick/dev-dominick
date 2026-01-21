'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input, Button } from '@/components/ui'
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
            <Link href="/login" className="text-sm text-matrix-text-secondary hover:text-matrix-text-primary transition-colors font-mono">
              Already have an account? <span className="text-matrix-primary font-medium">Sign in</span>
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
            <h1 className="text-2xl font-bold text-matrix-text-primary font-mono">Create Account</h1>
            <p className="text-matrix-text-secondary mt-1">
              Get started with your free account today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            />

            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 10 characters"
              label="Password"
              hint="Must contain uppercase, lowercase, number, and be at least 10 characters"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  Create Account
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

