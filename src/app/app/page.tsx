'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, Video, Clock, User, CheckCircle, XCircle,
  MessageSquare, ShoppingCart, Settings, FileText
} from 'lucide-react'
import { Button, BookingCalendar, ConfirmModal } from '@/components/ui'
import { formatters } from '@/lib/formatters'

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  startTime: string
  endTime: string
  notes?: string
  status: string
  billableHours?: number
}

interface OrderSummary {
  id: string
  total: number
  status: string
  createdAt: string
}

interface AvailabilityRow {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

// Stat card component
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  accentColor = 'accent' 
}: { 
  label: string
  value: string | number
  icon: React.ElementType
  accentColor?: 'accent' | 'success' | 'warning' | 'error'
}) {
  const bgColors = {
    accent: 'bg-[var(--accent-muted)]',
    success: 'bg-[var(--success-muted)]',
    warning: 'bg-[var(--warning-muted)]',
    error: 'bg-[var(--error-muted)]',
  }
  const textColors = {
    accent: 'text-[var(--accent)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    error: 'text-[var(--error)]',
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 transition-all hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
        <div className={`p-3 rounded-[var(--radius-md)] ${bgColors[accentColor]}`}>
          <Icon className={`w-5 h-5 ${textColors[accentColor]}`} />
        </div>
      </div>
    </div>
  )
}

// Quick action button
function QuickAction({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string
  icon: React.ElementType
  label: string
}) {
  return (
    <Link href={href} className="group">
      <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-overlay)] transition-all group-hover:border-[var(--accent)]/40 group-hover:bg-[var(--accent-subtle)]">
        <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
        <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
          {label}
        </span>
      </div>
    </Link>
  )
}

// Appointment card with approve/reject actions
function AppointmentCard({
  appointment,
  onApprove,
  onReject,
}: {
  appointment: Appointment
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}) {
  const sessionDate = new Date(appointment.startTime)
  const now = new Date()
  const isToday = sessionDate.toDateString() === now.toDateString()
  const isNow = Math.abs(sessionDate.getTime() - now.getTime()) < 15 * 60 * 1000
  const isPending = appointment.status === 'pending_approval'

  const statusStyles: Record<string, string> = {
    pending_approval: 'bg-[var(--warning-muted)] text-[var(--warning)]',
    confirmed: 'bg-[var(--success-muted)] text-[var(--success)]',
    completed: 'bg-[var(--accent-muted)] text-[var(--accent)]',
    cancelled: 'bg-[var(--error-muted)] text-[var(--error)]',
    scheduled: 'bg-[var(--accent-muted)] text-[var(--accent)]',
  }

  return (
    <div className="p-4 transition-colors hover:bg-[var(--surface-overlay)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-[var(--radius-md)] bg-[var(--accent-muted)]">
              <User className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">{appointment.clientName}</h3>
              <p className="text-sm text-[var(--text-muted)]">{appointment.clientEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] ml-11">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatters.datetime(sessionDate)}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[appointment.status] || statusStyles.scheduled}`}>
              {appointment.status.replace('_', ' ')}
            </span>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-muted)] text-[var(--accent)]">
                Today
              </span>
            )}
            {isNow && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success-muted)] text-[var(--success)] animate-pulse">
                Starting Soon
              </span>
            )}
          </div>

          {appointment.notes && (
            <p className="text-sm text-[var(--text-muted)] mt-2 ml-11 line-clamp-2">
              {appointment.notes}
            </p>
          )}

          {/* Approve/Reject buttons for pending appointments */}
          {isPending && onApprove && onReject && (
            <div className="flex items-center gap-2 mt-3 ml-11">
              <Button
                size="sm"
                onClick={() => onApprove(appointment.id)}
                className="bg-(--success) hover:bg-(--success)/90 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject(appointment.id)}
                className="border border-(--error)/50 text-(--error) hover:bg-(--error-muted)"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [availability, setAvailability] = useState<AvailabilityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [rejectModal, setRejectModal] = useState<{ open: boolean; appointmentId: string | null }>({
    open: false,
    appointmentId: null,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchData() {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        const [aptRes, ordersRes, availabilityRes] = await Promise.all([
          fetch('/api/appointments', { signal: controller.signal }),
          fetch('/api/orders?limit=5', { signal: controller.signal }),
          fetch('/api/availability', { signal: controller.signal }),
        ])

        clearTimeout(timeout)

        if (aptRes.ok) {
          const data = await aptRes.json()
          setAppointments(data.appointments || [])
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setOrders(data.orders || [])
        }

        if (availabilityRes.ok) {
          const data = await availabilityRes.json()
          setAvailability(data.availability || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'confirmed' }),
      })

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id ? { ...apt, status: 'confirmed' } : apt
          )
        )
      }
    } catch (error) {
      console.error('Error approving appointment:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'cancelled' }),
      })

      if (res.ok) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id))
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] font-mono text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const pendingAppointments = appointments.filter((a) => a.status === 'pending_approval')
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'scheduled' || a.status === 'upcoming'
  )
  const now = new Date()
  const todayAppointments = appointments.filter((a) => {
    const aptDate = new Date(a.startTime)
    return aptDate.toDateString() === now.toDateString()
  })
  const totalBillable = appointments.reduce((acc, a) => acc + (a.billableHours || 0), 0)
  const hasAvailability = availability.length > 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Welcome back, {session?.user?.name || 'Admin'}!
        </h1>
        <p className="text-[var(--text-secondary)]">
          {todayAppointments.length > 0
            ? `You have ${todayAppointments.length} appointment${todayAppointments.length > 1 ? 's' : ''} today`
            : 'No appointments scheduled for today'}
        </p>
      </div>

      {/* Pending Approval Alert */}
      {pendingAppointments.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--warning)]/30 bg-[var(--warning-muted)] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[var(--warning)]/20">
              <Clock className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                {pendingAppointments.length} appointment{pendingAppointments.length > 1 ? 's' : ''} awaiting approval
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Review and approve or reject pending bookings below
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today" value={todayAppointments.length} icon={Calendar} accentColor="accent" />
        <StatCard label="Pending" value={pendingAppointments.length} icon={Clock} accentColor="warning" />
        <StatCard label="Upcoming" value={upcomingAppointments.length} icon={Video} accentColor="success" />
        <StatCard label="Billable Hours" value={totalBillable.toFixed(1)} icon={FileText} accentColor="accent" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Column */}
        <div className="lg:col-span-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Calendar</h2>
              <Link href="/app/appointments">
                <Button variant="secondary" size="sm">Manage All</Button>
              </Link>
            </div>

            <BookingCalendar
              availabilitySlots={availability}
              appointments={appointments}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              monthsToShow={2}
              showTimeSlots={true}
              adminMode={true}
              onAppointmentClick={(apt) => {
                // Could open a modal or navigate to detail page
                console.log('Clicked appointment:', apt)
              }}
            />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAction href="/app/appointments" icon={Calendar} label="Appointments" />
              <QuickAction href="/app/orders" icon={ShoppingCart} label="Orders" />
              <QuickAction href="/app/contact-messages" icon={MessageSquare} label="Messages" />
              <QuickAction href="/app/settings" icon={Settings} label="Settings" />
            </div>
          </div>

          {/* Setup Health */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Setup Health</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Availability</span>
                <span className={hasAvailability ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                  {hasAvailability ? '✓ Configured' : '✗ Missing'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Admin Role</span>
                <span className="text-[var(--success)]">✓ Active</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Auto Booking</span>
                <span className="text-[var(--success)]">✓ Enabled</span>
              </li>
            </ul>
            {!hasAvailability && (
              <Link href="/app/appointments#availability" className="block mt-4">
                <Button size="sm" className="w-full">Add Availability</Button>
              </Link>
            )}
          </div>

          {/* Recent Orders */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)]">
            <div className="p-5 border-b border-[var(--border-default)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Orders</h3>
                <Link href="/app/orders">
                  <Button variant="secondary" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {orders.length === 0 ? (
                <div className="p-5 text-center text-[var(--text-muted)]">No orders yet</div>
              ) : (
                orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-[var(--text-primary)]">{order.id.slice(0, 8)}...</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatters.timeago(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {formatters.currency(order.total / 100)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] capitalize">{order.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Appointments Section */}
      {pendingAppointments.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <div className="p-6 border-b border-[var(--border-default)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Pending Approval ({pendingAppointments.length})
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              These bookings need your review
            </p>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {pendingAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onApprove={handleApprove}
                onReject={(id) => setRejectModal({ open: true, appointmentId: id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments Section */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)]">
        <div className="p-6 border-b border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Upcoming Appointments</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Confirmed sessions
              </p>
            </div>
            <Link href="/app/appointments">
              <Button variant="secondary" size="sm">View All</Button>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No upcoming appointments scheduled
            </div>
          ) : (
            upcomingAppointments.slice(0, 5).map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          )}
        </div>
      </div>

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
            handleReject(rejectModal.appointmentId)
          }
        }}
      />
    </div>
  )
}
