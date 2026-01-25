'use client'

import { useMemo } from 'react'
import { Clock } from 'lucide-react'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isAvailable: boolean
}

interface CalendarMonth {
  name: string
  days: CalendarDay[]
}

interface TimeSlot {
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  startTime: string
  endTime: string
  status: string
}

interface BookingCalendarProps {
  /** Available time slots from API */
  availabilitySlots: TimeSlot[]
  /** Existing appointments to show on calendar */
  appointments?: Appointment[]
  /** Currently selected date (YYYY-MM-DD format) */
  selectedDate: string
  /** Currently selected time (HH:MM format) */
  selectedTime: string
  /** Callback when date is selected */
  onDateSelect: (date: string) => void
  /** Callback when time is selected */
  onTimeSelect: (time: string) => void
  /** Number of months to show (default 2) */
  monthsToShow?: number
  /** Whether to show time slots */
  showTimeSlots?: boolean
  /** Whether in loading state */
  loading?: boolean
  /** Admin mode - shows all days, not just available */
  adminMode?: boolean
  /** Callback when appointment is clicked (admin mode) */
  onAppointmentClick?: (appointment: Appointment) => void
}

/**
 * Reusable calendar component for booking and admin views
 * Design system compliant - uses CSS variables
 */
export function BookingCalendar({
  availabilitySlots,
  appointments = [],
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  monthsToShow = 2,
  showTimeSlots = true,
  loading = false,
  adminMode = false,
  onAppointmentClick,
}: BookingCalendarProps) {
  // Generate calendar data for specified months
  const calendarMonths = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const months: CalendarMonth[] = []
    for (let monthOffset = 0; monthOffset < monthsToShow; monthOffset++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      // Sunday = 0 start
      const startPadding = firstDay.getDay()

      const days: CalendarDay[] = []

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
        const isAvailable = adminMode ? true : (isWeekday && isFuture)

        days.push({ date, isCurrentMonth: true, isAvailable })
      }

      months.push({
        name: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        days
      })
    }

    return months
  }, [monthsToShow, adminMode])

  // Generate time slots for selected date
  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate || availabilitySlots.length === 0) return []

    const [year, month, day] = selectedDate.split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    const dayOfWeek = localDate.getDay()

    const daySlots = availabilitySlots.filter(slot => slot.dayOfWeek === dayOfWeek)
    if (daySlots.length === 0) return []

    const times: string[] = []
    daySlots.forEach(slot => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number)
      const [endHour, endMin] = slot.endTime.split(':').map(Number)

      let currentHour = startHour
      let currentMin = startMin

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        times.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`)
        currentMin += 30
        if (currentMin >= 60) {
          currentMin = 0
          currentHour++
        }
      }
    })

    return times
  }, [selectedDate, availabilitySlots])

  // Get appointments for a specific date
  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime)
      const y = aptDate.getFullYear()
      const m = String(aptDate.getMonth() + 1).padStart(2, '0')
      const d = String(aptDate.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}` === dateStr
    })
  }

  if (loading) {
    return (
      <div className="py-6 text-center text-[var(--text-muted)]">
        Loading availability...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <div className={`grid gap-3 ${monthsToShow > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {calendarMonths.map((monthData, monthIdx) => (
          <div
            key={monthIdx}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-3"
          >
            <h3 className="mb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {monthData.name}
            </h3>

            {/* Weekday headers */}
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
                const year = dayData.date.getFullYear()
                const month = String(dayData.date.getMonth() + 1).padStart(2, '0')
                const day = String(dayData.date.getDate()).padStart(2, '0')
                const dateStr = `${year}-${month}-${day}`
                const isSelected = selectedDate === dateStr && dayData.isCurrentMonth
                const isToday = dayData.date.toDateString() === new Date().toDateString() && dayData.isCurrentMonth
                const dayAppointments = adminMode ? getAppointmentsForDate(dateStr) : []
                const hasAppointments = dayAppointments.length > 0

                return (
                  <button
                    key={dayIdx}
                    type="button"
                    disabled={!adminMode && !dayData.isAvailable}
                    onClick={() => {
                      if (dayData.isAvailable || adminMode) {
                        onDateSelect(dateStr)
                        onTimeSelect('')
                      }
                    }}
                    className={`
                      aspect-square rounded text-xs font-medium transition-all relative
                      ${!dayData.isCurrentMonth ? 'text-[var(--text-muted)] opacity-30 cursor-default' : ''}
                      ${dayData.isAvailable && !isSelected ? 'bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]' : ''}
                      ${isSelected ? 'bg-[var(--accent)] text-[var(--surface-base)] font-bold' : ''}
                      ${!dayData.isAvailable && dayData.isCurrentMonth && !adminMode ? 'text-[var(--text-muted)] opacity-50 cursor-not-allowed' : ''}
                      ${isToday && !isSelected ? 'ring-1 ring-[var(--accent)]/50' : ''}
                      ${hasAppointments && !isSelected ? 'bg-[var(--accent-muted)]' : ''}
                    `}
                  >
                    {dayData.date.getDate()}
                    {hasAppointments && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      {showTimeSlots && selectedDate && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {adminMode ? 'Time Slots' : 'Pick a time'}
            </h3>
            <span className="text-sm text-[var(--text-secondary)]">
              {(() => {
                const [year, month, day] = selectedDate.split('-').map(Number)
                const localDate = new Date(year, month - 1, day)
                return localDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })
              })()}
            </span>
          </div>

          {timeSlotsForDate.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 text-center text-[var(--text-secondary)]">
              No time slots available for this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {timeSlotsForDate.map((time) => {
                const isSelected = selectedTime === time
                const [hours, minutes] = time.split(':').map(Number)
                const isPM = hours >= 12
                const displayHours = hours % 12 || 12

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onTimeSelect(time)}
                    className={`
                      flex flex-col items-center justify-center rounded-lg border-2 py-2 transition-all
                      ${isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] scale-105'
                        : 'border-[var(--border-default)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-subtle)]'
                      }
                    `}
                  >
                    <Clock className={`h-3 w-3 mb-0.5 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                    <span className="font-mono text-xs font-semibold">
                      {displayHours}:{minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {isPM ? 'PM' : 'AM'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Show appointments for selected date in admin mode */}
          {adminMode && selectedDate && (
            <AppointmentsList
              appointments={getAppointmentsForDate(selectedDate)}
              onAppointmentClick={onAppointmentClick}
            />
          )}
        </div>
      )}
    </div>
  )
}

/** Appointments list for admin view */
function AppointmentsList({
  appointments,
  onAppointmentClick,
}: {
  appointments: Appointment[]
  onAppointmentClick?: (apt: Appointment) => void
}) {
  if (appointments.length === 0) return null

  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">
        Appointments ({appointments.length})
      </h4>
      <div className="space-y-2">
        {appointments.map((apt) => {
          const time = new Date(apt.startTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
          const statusColors: Record<string, string> = {
            pending_approval: 'bg-[var(--warning-muted)] text-[var(--warning)] border-[var(--warning)]/30',
            confirmed: 'bg-[var(--success-muted)] text-[var(--success)] border-[var(--success)]/30',
            completed: 'bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/30',
            cancelled: 'bg-[var(--error-muted)] text-[var(--error)] border-[var(--error)]/30',
          }

          return (
            <button
              key={apt.id}
              onClick={() => onAppointmentClick?.(apt)}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                ${statusColors[apt.status] || 'bg-[var(--surface-raised)] border-[var(--border-default)]'}
                hover:scale-[1.01] hover:shadow-md
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{apt.clientName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{apt.clientEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{time}</p>
                  <p className="text-xs capitalize">{apt.status.replace('_', ' ')}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BookingCalendar
