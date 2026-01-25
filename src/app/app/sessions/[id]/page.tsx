'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { VideoSession } from '@/components/client/video-session'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SessionPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Guest token from magic link
  const token = searchParams.get('token')

  useEffect(() => {
    params.then(({ id }) => setSessionId(id))
  }, [params])

  useEffect(() => {
    if (!sessionId) return

    async function validateAndFetchSession() {
      try {
        // If guest token, validate it first
        if (token && status === 'unauthenticated') {
          const tokenRes = await fetch('/api/auth/session-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, sessionId }),
          })

          if (!tokenRes.ok) {
            setError('Invalid or expired session link')
            setLoading(false)
            return
          }

          // Token valid, will create guest session
          const tokenData = await tokenRes.json()
          if (tokenData.success) {
            // Reload to get new session
            window.location.reload()
            return
          }
        }

        // Fetch appointment details
        const res = await fetch(`/api/appointments?sessionId=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.appointment) {
            setAppointment(data.appointment)
          } else {
            setError('Session not found')
          }
        } else {
          setError('Failed to load session details')
        }
      } catch (err) {
        console.error('Session validation error:', err)
        setError('Failed to validate session')
      } finally {
        setLoading(false)
      }
    }

    validateAndFetchSession()
  }, [sessionId, token, status])

  if (loading || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-matrix-black">
        <div className="animate-pulse text-matrix-primary font-mono">Loading session...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-matrix-black">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
          <Link href="/app">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isHost = session?.user?.role === 'admin' || session?.user?.role === 'admin-main'
  const userName = session?.user?.name || appointment?.clientName || 'Guest'

  return (
    <div className="h-screen w-full bg-matrix-black">
      <VideoSession 
        sessionId={sessionId} 
        userName={userName}
        isHost={isHost}
      />
    </div>
  )
}
