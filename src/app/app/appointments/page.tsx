'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Plus, User } from 'lucide-react'
import { Button, Input, Textarea, ConfirmModal } from '@/components/ui'
import { formatters } from '@/lib/formatters'

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

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_approval: 'bg-[var(--warning-muted)] text-[var(--warning)]',
    scheduled: 'bg-[var(--accent-muted)] text-[var(--accent)]',
    confirmed: 'bg-[var(--success-muted)] text-[var(--success)]',
    completed: 'bg-[var(--success-muted)] text-[var(--success)]',
    cancelled: 'bg-[var(--error-muted)] text-[var(--error)]',
  }

  const labels: Record<string, string> = {
    pending_approval: 'Pending approval',
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.scheduled}`}>
      {labels[status] || status}
    </span>
  )
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'appointments' | 'availability'>('appointments')
  const [showAddAvailability, setShowAddAvailability] = useState(false)
  const [rejectModal, setRejectModal] = useState<{ open: boolean; appointmentId: string | null }>({
    open: false,
    appointmentId: null,
  })
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-sm">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Appointments & Scheduling
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage bookings and set your availability
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-default)]">
        <button
          onClick={() => setTab('appointments')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'appointments'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setTab('availability')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'availability'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Availability ({availability.length})
        </button>
      </div>

      {/* Appointments Tab */}
      {tab === 'appointments' && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <Calendar className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)]">No appointments yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Appointments will appear here when clients book</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(apt => (
                <div
                  key={apt.id}
                  className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] hover:border-[var(--border-strong)] transition-all overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Client info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-md bg-[var(--accent-muted)]">
                            <User className="w-4 h-4 text-[var(--accent)]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">{apt.clientName}</h3>
                            <p className="text-sm text-[var(--text-muted)]">{apt.clientEmail}</p>
                          </div>
                          <StatusBadge status={apt.status} />
                        </div>

                        {/* Time info */}
                        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)] ml-11 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatters.date(apt.startTime)}
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
                          <p className="text-sm text-[var(--text-muted)] ml-11 italic mb-3">
                            Client notes: {apt.notes}
                          </p>
                        )}

                        {/* Approve/Reject for pending */}
                        {apt.status === 'pending_approval' && (
                          <div className="flex items-center gap-2 ml-11 mb-3">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApproveAppointment(apt.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRejectModal({ open: true, appointmentId: apt.id })}
                              className="text-[var(--error)] hover:bg-[var(--error-muted)]"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {/* Work tracking */}
                        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] ml-11">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-xs uppercase tracking-wide text-[var(--text-muted)] block mb-2">
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
                              />
                            </div>

                            <div>
                              <label className="text-xs uppercase tracking-wide text-[var(--text-muted)] block mb-2">
                                Work Notes
                              </label>
                              <Textarea
                                value={apt.workNotes || ''}
                                onChange={(e) =>
                                  setAppointments((prev) => prev.map((p) => p.id === apt.id ? { ...p, workNotes: e.target.value } : p))
                                }
                                textareaSize="sm"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <Button size="sm" onClick={() => handleUpdateAppointment(apt)}>
                              Save Work Log
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Right side metadata */}
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                          {formatters.timeago(apt.createdAt)}
                        </p>
                        <a
                          href={`mailto:${apt.clientEmail}`}
                          className="text-[var(--accent)] hover:underline text-sm font-medium"
                        >
                          Email
                        </a>
                      </div>
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
              className="p-6 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">New Time Slot</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="dayOfWeek" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Day of Week
                  </label>
                  <select
                    id="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                    aria-label="Select day of week"
                    className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    {DAYS.map((day, i) => (
                      <option key={i} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={formData.timezone}
                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                    aria-label="Select timezone"
                    className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="CST">CST</option>
                    <option value="MST">MST</option>
                    <option value="PST">PST</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save Time Slot</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddAvailability(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {availability.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <AlertCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)] mb-2">No availability set yet</p>
              <p className="text-sm text-[var(--text-muted)]">Add your availability so clients can book appointments</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {availability.map(avail => (
                <div
                  key={avail.id}
                  className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] hover:border-[var(--border-strong)] transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {DAYS[avail.dayOfWeek]}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {avail.startTime} - {avail.endTime} ({avail.timezone})
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteAvailability(avail.id)}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error-muted)] rounded-md transition-colors"
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

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        open={rejectModal.open}
        onOpenChange={(open) => setRejectModal({ open, appointmentId: open ? rejectModal.appointmentId : null })}
        title="Reject Appointment"
        description="Are you sure you want to reject this appointment? This will cancel the booking and notify the client."
        confirmLabel="Reject"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={() => {
          if (rejectModal.appointmentId) {
            handleRejectAppointment(rejectModal.appointmentId)
          }
        }}
      />
    </div>
  )
}
