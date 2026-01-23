'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Video, Clock, User, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatters } from '@/lib/utils'

interface Appointment {
    id: string
    sessionId: string
    clientName: string
    clientEmail: string
    scheduledTime: string
    notes?: string
    status: 'upcoming' | 'completed' | 'cancelled'
    createdAt: string
}

export default function AppointmentsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status, router])

    useEffect(() => {
        async function fetchAppointments() {
            try {
                const res = await fetch('/api/appointments')
                if (res.ok) {
                    const data = await res.json()
                    setAppointments(data.appointments || [])
                }
            } catch (error) {
                console.error('Failed to fetch appointments:', error)
            } finally {
                setLoading(false)
            }
        }

        if (status === 'authenticated') {
            fetchAppointments()
        }
    }, [status])

    if (status === 'loading' || status === 'unauthenticated') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-matrix-primary font-mono">Loading...</div>
            </div>
        )
    }

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true
        return apt.status === filter
    })

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Appointments</h1>
                <p className="text-slate-400">Manage your client sessions</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                >
                    All ({appointments.length})
                </Button>
                <Button
                    variant={filter === 'upcoming' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('upcoming')}
                >
                    Upcoming ({appointments.filter(a => a.status === 'upcoming').length})
                </Button>
                <Button
                    variant={filter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('completed')}
                >
                    Completed ({appointments.filter(a => a.status === 'completed').length})
                </Button>
            </div>

            {/* Appointments List */}
            <div className="bg-matrix-darker/50 border border-matrix-border/20 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <div className="animate-pulse">Loading appointments...</div>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        No {filter !== 'all' ? filter : ''} appointments found
                    </div>
                ) : (
                    <div className="divide-y divide-matrix-border/10">
                        {filteredAppointments.map((appointment) => {
                            const sessionDate = new Date(appointment.scheduledTime)
                            const now = new Date()
                            const isPast = sessionDate < now
                            const isNow = Math.abs(sessionDate.getTime() - now.getTime()) < 15 * 60 * 1000

                            return (
                                <div key={appointment.id} className="p-6 hover:bg-matrix-border/5 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-matrix-primary/10 rounded-lg">
                                                    <User className="w-5 h-5 text-matrix-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white text-lg">{appointment.clientName}</h3>
                                                    <p className="text-sm text-slate-400">{appointment.clientEmail}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-slate-400 ml-14 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatters.date(sessionDate)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {appointment.status === 'upcoming' && (
                                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                                                            Upcoming
                                                        </span>
                                                    )}
                                                    {appointment.status === 'completed' && (
                                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">
                                                            Completed
                                                        </span>
                                                    )}
                                                    {isNow && appointment.status === 'upcoming' && (
                                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full animate-pulse">
                                                            Starting Soon
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {appointment.notes && (
                                                <p className="text-sm text-slate-500 ml-14 mb-2">
                                                    {appointment.notes}
                                                </p>
                                            )}

                                            <div className="text-xs text-slate-600 ml-14">
                                                Session ID: <code className="font-mono">{appointment.sessionId}</code>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {appointment.status === 'upcoming' && (
                                                <Link href={`/app/sessions/${appointment.sessionId}`}>
                                                    <Button
                                                        variant={isNow ? 'default' : 'outline'}
                                                        size="sm"
                                                        className="gap-2"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        Join Session
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
