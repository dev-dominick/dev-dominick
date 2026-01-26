'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

const BOOKING_LOCKED = true

interface TimeSlot {
    dayOfWeek: number
    startTime: string
    endTime: string
}

interface BookedAppointment {
    id: string
    startTime: string
    endTime: string
    status: string
}

export default function BookingsPage() {
    const searchParams = useSearchParams()
    const consultationType = searchParams.get('type') || 'free'
    const fromProduct = searchParams.get('from') === 'product'
    const simpleMode = SIMPLE_CONSULTING_MODE

    const [showComingSoonModal, setShowComingSoonModal] = useState(BOOKING_LOCKED)
    const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([])
    const [bookedAppointments, setBookedAppointments] = useState<BookedAppointment[]>([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [website, setWebsite] = useState('') // Honeypot field - bots fill this
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedTime, setSelectedTime] = useState<string>('')
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Fetch availability and existing appointments on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [availRes, aptRes] = await Promise.all([
                    fetch('/api/availability'),
                    fetch('/api/appointments')
                ])
                
                if (!availRes.ok) throw new Error('Failed to fetch availability')
                const availData = await availRes.json()
                setAvailabilitySlots(availData.availability || [])
                
                if (aptRes.ok) {
                    const aptData = await aptRes.json()
                    // Only keep pending or confirmed appointments (not cancelled)
                    const activeApts = (aptData.appointments || []).filter(
                        (apt: BookedAppointment) => apt.status === 'pending_approval' || apt.status === 'confirmed'
                    )
                    setBookedAppointments(activeApts)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('Could not load available times. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

  // Generate calendar for current and next month
  const calendarMonths = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const months = []
    for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      // Get first day of month and last day
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      // Calculate padding days (to align with week start on Sunday)
      const startPadding = firstDay.getDay() // Sunday = 0

      const days = []

      // Add padding days from previous month
      for (let i = 0; i < startPadding; i++) {
        const paddingDate = new Date(firstDay)
        paddingDate.setDate(paddingDate.getDate() - (startPadding - i))
        days.push({ date: paddingDate, isCurrentMonth: false, isAvailable: false })
      }

      // Add days of current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day)
        const isWeekday = date.getDay() >= 1 && date.getDay() <= 5
        const isFuture = date > today
        const isAvailable = isWeekday && isFuture

        days.push({ date, isCurrentMonth: true, isAvailable })
      }

      months.push({
        name: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        days,
      })
    }

    return months
  }, [])

  // Check if a date has any existing bookings
  const dateHasBookings = (dateStr: string) => {
    return bookedAppointments.some((apt) => {
      const aptDate = new Date(apt.startTime)
      const y = aptDate.getFullYear()
      const m = String(aptDate.getMonth() + 1).padStart(2, '0')
      const d = String(aptDate.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}` === dateStr
    })
  }

  // Get available time slots for selected date (excluding already-booked slots)
  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate) return []

    const [year, month, day] = selectedDate.split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    const dayOfWeek = localDate.getDay()

    const daySlots = availabilitySlots.filter((slot) => slot.dayOfWeek === dayOfWeek)

    // Generate 30-min intervals between slot times
    const times: string[] = []

    daySlots.forEach((slot) => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number)
      const [endHour, endMin] = slot.endTime.split(':').map(Number)

      let current = new Date()
      current.setHours(startHour, startMin, 0, 0)
      const end = new Date()
      end.setHours(endHour, endMin, 0, 0)

      while (current < end) {
        const hours = String(current.getHours()).padStart(2, '0')
        const mins = String(current.getMinutes()).padStart(2, '0')
        times.push(`${hours}:${mins}`)
        current.setMinutes(current.getMinutes() + 30)
      }
    })

    // Filter out times that overlap with existing booked appointments
    const availableTimes = times.filter((time) => {
      const [slotHour, slotMin] = time.split(':').map(Number)
      const slotStart = new Date(year, month - 1, day, slotHour, slotMin)
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000) // 30 min duration

      // Check if this slot overlaps with any booked appointment
      const isBooked = bookedAppointments.some((apt) => {
        const aptStart = new Date(apt.startTime)
        const aptEnd = new Date(apt.endTime)
        // Overlap check: slot starts before apt ends AND slot ends after apt starts
        return slotStart < aptEnd && slotEnd > aptStart
      })

      return !isBooked
    })

    return availableTimes
  }, [selectedDate, availabilitySlots, bookedAppointments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !selectedDate || !selectedTime) {
      setError('Please fill in all fields')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          date: selectedDate,
          time: selectedTime,
          consultationType,
          consultationSource: fromProduct ? 'product_upsell' : 'landing',
          durationMinutes: 30,
          website, // Honeypot field - API rejects if filled
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment')
      }

      setSuccess(true)
      window.scrollTo(0, 0) // Scroll to top to show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (showComingSoonModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[var(--surface-raised)] rounded-2xl border border-[var(--border-default)] p-8 max-w-md w-full shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-[var(--accent)]" />
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Coming Soon</h2>
            </div>
            <button
              onClick={() => setShowComingSoonModal(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-[var(--text-secondary)] mb-2 text-lg">
            Bookings coming soon!
          </p>
          <p className="text-[var(--text-muted)] mb-6">
            Please send me a message and I'll get back to you as soon as possible.
          </p>

          <div className="space-y-3">
            <Link href="/contact" className="block w-full">
              <Button variant="primary" className="w-full">
                Go to contact form
              </Button>
            </Link>
            <Link href="/" className="block w-full">
              <Button variant="secondary" className="w-full">
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-[var(--success)] mb-4" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Call booked! 🎉</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-4">
              Check your email for confirmation. I'll send the call link within a few hours.
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Looking forward to our conversation.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/">
                <Button variant="primary">Back to home</Button>
              </Link>
              {simpleMode ? (
                <Link href="/contact">
                  <Button variant="secondary">Contact</Button>
                </Link>
              ) : (
                <Link href="/shop">
                  <Button variant="secondary">Continue shopping</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Title & Type Badge */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Book an intro call</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/50 bg-[var(--accent-muted)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
              30-minute conversation. No pitch. No pressure.
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-[var(--error)]/30 bg-[var(--error-muted)] p-4">
            <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your info</h2>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="your@email.com"
              />
            </div>

            {/* Honeypot field - hidden from humans, filled by bots */}
            <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Pick a date</h2>

            {loading ? (
              <div className="py-6 text-center text-[var(--text-muted)]">Loading availability...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {calendarMonths.map((monthData, monthIdx) => (
                  <div key={monthIdx} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-3">
                    <h3 className="mb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {monthData.name}
                    </h3>

                    {/* Weekday headers - Sunday first */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-[10px] font-medium text-[var(--text-muted)] py-0.5">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                      {monthData.days.map((dayData, dayIdx) => {
                        // Use local date string for consistent comparison (YYYY-MM-DD in local timezone)
                        const year = dayData.date.getFullYear()
                        const month = String(dayData.date.getMonth() + 1).padStart(2, '0')
                        const day = String(dayData.date.getDate()).padStart(2, '0')
                        const dateStr = `${year}-${month}-${day}`
                        // Only highlight if this cell belongs to its own month
                        const isSelected = selectedDate === dateStr && dayData.isCurrentMonth
                        const isToday = dayData.date.toDateString() === new Date().toDateString() && dayData.isCurrentMonth
                        const hasBookings = dayData.isCurrentMonth && dateHasBookings(dateStr)

                        return (
                          <button
                            key={dayIdx}
                            type="button"
                            disabled={!dayData.isAvailable}
                            onClick={() => {
                              if (dayData.isAvailable) {
                                setSelectedDate(dateStr)
                                setSelectedTime('')
                              }
                            }}
                            className={`
                              aspect-square rounded text-xs font-medium transition-all relative
                              ${!dayData.isCurrentMonth ? 'text-[var(--text-muted)]/40 cursor-default' : ''}
                              ${dayData.isAvailable && !isSelected ? 'bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent)]' : ''}
                              ${isSelected ? 'bg-[var(--accent)] text-[var(--surface-base)] font-bold' : ''}
                              ${!dayData.isAvailable && dayData.isCurrentMonth ? 'text-[var(--text-muted)] cursor-not-allowed' : ''}
                              ${isToday && !isSelected ? 'ring-1 ring-[var(--accent)]/50' : ''}
                            `}
                          >
                            {dayData.date.getDate()}
                            {hasBookings && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--warning)]" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Pick a time</h2>
                <span className="text-sm text-[var(--text-secondary)]">
                  {(() => {
                    const [year, month, day] = selectedDate.split('-').map(Number)
                    const localDate = new Date(year, month - 1, day)
                    return localDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })
                  })()}
                </span>
              </div>

              {timeSlotsForDate.length === 0 ? (
                <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 text-center text-[var(--text-secondary)]">
                  No time slots available for this date. Please choose another.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {timeSlotsForDate.map((time) => {
                    const isSelected = selectedTime === time
                    const [hours, minutes] = time.split(':').map(Number)
                    const isPM = hours >= 12
                    const displayHours = hours % 12 || 12

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`
                          flex flex-col items-center justify-center rounded-lg border-2 py-3 transition-all
                          ${
                            isSelected
                              ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] shadow-md scale-105'
                              : 'border-[var(--border-default)] bg-[var(--surface-raised)] text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-muted)]'
                          }
                        `}
                      >
                        <Clock className={`h-4 w-4 mb-1 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                        <span className="font-mono text-sm font-semibold">
                          {displayHours}:{minutes.toString().padStart(2, '0')}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{isPM ? 'PM' : 'AM'}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting || !name || !email || !selectedDate || !selectedTime} className="flex-1">
              {submitting ? 'Booking...' : 'Confirm booking'}
            </Button>
            <Link href="/" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
