'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle, Trash2, Plus } from 'lucide-react'
import { Button, Input, Textarea } from '@/components/ui'

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  startTime: string
  endTime: string
  status: string
  notes?: string
  createdAt: string
  billableHours?: number
  workNotes?: string
}

interface Availability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  timezone: string
  isActive: boolean
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'appointments' | 'availability'>('appointments')
  const [showAddAvailability, setShowAddAvailability] = useState(false)
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'UTC',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [appointmentsRes, availabilityRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/availability'),
      ])

      const appointmentsData = await appointmentsRes.json()
      const availabilityData = await availabilityRes.json()

      setAppointments(appointmentsData.appointments || [])
      setAvailability(availabilityData.availability || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setAvailability([...availability, data.availability])
        setShowAddAvailability(false)
        setFormData({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'UTC',
        })
      }
    } catch (error) {
      console.error('Error adding availability:', error)
    }
  }

  const handleDeleteAvailability = async (id: string) => {
    try {
      const res = await fetch(`/api/availability?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAvailability(availability.filter(a => a.id !== id))
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
    }
  }

  const handleUpdateAppointment = async (apt: Appointment) => {
    const payload = {
      id: apt.id,
      billableHours: apt.billableHours ?? 0,
      workNotes: apt.workNotes ?? '',
      notes: apt.notes ?? '',
    }

    try {
      await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  const handleApproveAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointmentId,
          status: 'confirmed',
          isApproved: true,
        }),
      })

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: 'confirmed' } : apt
          )
        )
      }
    } catch (error) {
      console.error('Error approving appointment:', error)
    }
  }

  const handleRejectAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure? This will cancel the appointment.')) return

    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointmentId,
          status: 'cancelled',
        }),
      })

      if (res.ok) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-matrix-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-matrix-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-matrix-text-primary font-mono mb-4">
            Appointments & Scheduling
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-matrix-border/20">
            <button
              onClick={() => setTab('appointments')}
              className={`px-4 py-2 font-mono text-sm font-semibold border-b-2 transition-colors ${
                tab === 'appointments'
                  ? 'border-matrix-primary text-matrix-primary'
                  : 'border-transparent text-matrix-text-secondary hover:text-matrix-text-primary'
              }`}
            >
              Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setTab('availability')}
              className={`px-4 py-2 font-mono text-sm font-semibold border-b-2 transition-colors ${
                tab === 'availability'
                  ? 'border-matrix-primary text-matrix-primary'
                  : 'border-transparent text-matrix-text-secondary hover:text-matrix-text-primary'
              }`}
            >
              Your Availability ({availability.length})
            </button>
          </div>
        </div>

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-12 border border-matrix-border/20 rounded-lg bg-matrix-darker">
                <Calendar className="w-12 h-12 text-matrix-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-matrix-text-secondary">No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(apt => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-lg border border-matrix-border/20 bg-matrix-darker hover:border-matrix-border/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-matrix-text-primary">{apt.clientName}</h3>
                          {apt.status === 'pending_approval' && (
                            <span className="px-2 py-1 bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-400 rounded text-xs font-semibold">
                              Pending approval
                            </span>
                          )}
                          {apt.status === 'scheduled' && (
                            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 rounded text-xs font-semibold">
                              Scheduled
                            </span>
                          )}
                          {apt.status === 'confirmed' && (
                            <span className="px-2 py-1 bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400 rounded text-xs font-semibold">
                              Confirmed
                            </span>
                          )}
                          {apt.status === 'completed' && (
                            <span className="px-2 py-1 bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400 rounded text-xs font-semibold">
                              Completed
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-matrix-text-secondary mb-2">{apt.clientEmail}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-matrix-text-secondary mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(apt.startTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(apt.startTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {new Date(apt.endTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        {apt.notes && (
                          <p className="text-sm text-matrix-text-secondary italic">Notes: {apt.notes}</p>
                        )}

                        {apt.status === 'pending_approval' && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApproveAppointment(apt.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRejectAppointment(apt.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-xs uppercase tracking-wide text-matrix-text-muted block mb-2">
                              Billable Hours
                            </label>
                            <Input
                              type="number"
                              step="0.25"
                              min={0}
                              value={apt.billableHours ?? 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value)
                                setAppointments((prev) => prev.map((p) => p.id === apt.id ? { ...p, billableHours: isNaN(val) ? 0 : val } : p))
                              }}
                              className="bg-matrix-dark border-matrix-border/40"
                            />
                          </div>

                          <div>
                            <label className="text-xs uppercase tracking-wide text-matrix-text-muted block mb-2">
                              Work Notes
                            </label>
                            <Textarea
                              value={apt.workNotes || ''}
                              onChange={(e) =>
                                setAppointments((prev) => prev.map((p) => p.id === apt.id ? { ...p, workNotes: e.target.value } : p))
                              }
                              className="bg-matrix-dark border-matrix-border/40"
                              textareaSize="sm"
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex gap-3">
                          <Button size="sm" onClick={() => handleUpdateAppointment(apt)}>
                            Save Work Log
                          </Button>
                          {apt.notes && (
                            <span className="text-xs text-matrix-text-muted self-center">Client notes kept above</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-matrix-text-muted mb-2">
                          Booked {new Date(apt.createdAt).toLocaleDateString()}
                        </p>
                        <a
                          href={`mailto:${apt.clientEmail}`}
                          className="text-matrix-primary hover:underline text-sm font-semibold"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Availability Tab */}
        {tab === 'availability' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowAddAvailability(!showAddAvailability)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Time Slot
              </Button>
            </div>

            {showAddAvailability && (
              <form
                onSubmit={handleAddAvailability}
                className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker"
              >
                <h3 className="text-lg font-bold text-matrix-text-primary mb-4 font-mono">New Time Slot</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-matrix-text-primary mb-2 font-mono">
                      Day of Week
                    </label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                      title="Select day of week"
                      className="w-full h-10 px-3 rounded-md border border-matrix-border/30 bg-matrix-dark text-matrix-text-primary focus:outline-none focus:ring-2 focus:ring-matrix-primary font-mono"
                    >
                      {DAYS.map((day, i) => (
                        <option key={i} value={i}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-matrix-text-primary mb-2 font-mono">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                      title="Select timezone"
                      className="w-full h-10 px-3 rounded-md border border-matrix-border/30 bg-matrix-dark text-matrix-text-primary focus:outline-none focus:ring-2 focus:ring-matrix-primary font-mono"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">EST</option>
                      <option value="CST">CST</option>
                      <option value="MST">MST</option>
                      <option value="PST">PST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-matrix-text-primary mb-2 font-mono">
                      Start Time
                    </label>
                    <input
                      type="time"
                      placeholder="Start Time"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-matrix-border/30 bg-matrix-dark text-matrix-text-primary focus:outline-none focus:ring-2 focus:ring-matrix-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-matrix-text-primary mb-2 font-mono">
                      End Time
                    </label>
                    <input
                      type="time"
                      placeholder="End Time"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-matrix-border/30 bg-matrix-dark text-matrix-text-primary focus:outline-none focus:ring-2 focus:ring-matrix-primary font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Save Time Slot</Button>
                  <button
                    type="button"
                    onClick={() => setShowAddAvailability(false)}
                    className="px-4 py-2 text-matrix-text-secondary hover:text-matrix-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {availability.length === 0 ? (
              <div className="text-center py-12 border border-matrix-border/20 rounded-lg bg-matrix-darker">
                <AlertCircle className="w-12 h-12 text-matrix-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-matrix-text-secondary mb-4">No availability set yet</p>
                <p className="text-sm text-matrix-text-muted">Add your availability so clients can book appointments</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {availability.map(avail => (
                  <div
                    key={avail.id}
                    className="p-4 rounded-lg border border-matrix-border/20 bg-matrix-darker hover:border-matrix-border/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-matrix-text-primary">
                        {DAYS[avail.dayOfWeek]}
                      </p>
                      <p className="text-sm text-matrix-text-secondary">
                        {avail.startTime} - {avail.endTime} ({avail.timezone})
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteAvailability(avail.id)}
                      className="p-2 text-matrix-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      title="Delete availability slot"
                      aria-label="Delete availability slot"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
