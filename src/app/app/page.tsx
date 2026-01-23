'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Video, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatters } from '@/lib/utils'

interface Session {
  id: string
  sessionId: string
  clientName: string
  clientEmail: string
  scheduledTime: string
  notes?: string
  status: 'upcoming' | 'completed' | 'cancelled'
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/appointments')
        if (res.ok) {
          const data = await res.json()
          setSessions(data.appointments || [])
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchSessions()
    }
  }, [status])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-matrix-primary font-mono">Loading...</div>
      </div>
    )
  }

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming')
  const now = new Date()
  const todaySessions = upcomingSessions.filter(s => {
    const sessionDate = new Date(s.scheduledTime)
    return sessionDate.toDateString() === now.toDateString()
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {session?.user?.name || 'there'}!
        </h1>
        <p className="text-slate-400">
          {todaySessions.length > 0
            ? `You have ${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} today`
            : 'No sessions scheduled for today'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-matrix-darker/50 border border-matrix-border/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Today</p>
              <p className="text-2xl font-bold text-white">{todaySessions.length}</p>
            </div>
            <div className="p-3 bg-matrix-primary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-matrix-primary" />
            </div>
          </div>
        </div>

        <div className="bg-matrix-darker/50 border border-matrix-border/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-white">{upcomingSessions.length}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-matrix-darker/50 border border-matrix-border/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{sessions.length}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-matrix-darker/50 border border-matrix-border/20 rounded-lg">
        <div className="p-6 border-b border-matrix-border/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
            <Link href="/app/appointments">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </div>

        <div className="divide-y divide-matrix-border/10">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <div className="animate-pulse">Loading sessions...</div>
            </div>
          ) : upcomingSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No upcoming sessions scheduled
            </div>
          ) : (
            upcomingSessions.slice(0, 5).map((session) => {
              const sessionDate = new Date(session.scheduledTime)
              const isToday = sessionDate.toDateString() === now.toDateString()
              const isNow = Math.abs(sessionDate.getTime() - now.getTime()) < 15 * 60 * 1000 // Within 15 minutes

              return (
                <div key={session.id} className="p-6 hover:bg-matrix-border/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-matrix-primary/10 rounded-lg">
                          <User className="w-4 h-4 text-matrix-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{session.clientName}</h3>
                          <p className="text-sm text-slate-400">{session.clientEmail}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400 ml-11">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatters.date(sessionDate)}
                        </div>
                        {isToday && (
                          <span className="px-2 py-1 bg-matrix-primary/10 text-matrix-primary text-xs rounded-full">
                            Today
                          </span>
                        )}
                        {isNow && (
                          <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full animate-pulse">
                            Starting Soon
                          </span>
                        )}
                      </div>

                      {session.notes && (
                        <p className="text-sm text-slate-500 mt-2 ml-11 line-clamp-2">
                          {session.notes}
                        </p>
                      )}
                    </div>

                    <Link href={`/app/sessions/${session.sessionId}`}>
                      <Button 
                        variant={isNow ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
