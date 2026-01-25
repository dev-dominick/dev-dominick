'use client'

import { useEffect, useState } from 'react'
import { Mail, Users, Download, Search, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { Button, Input, ConfirmModal } from '@/components/ui'
import { formatters } from '@/lib/formatters'

interface Subscriber {
  id: string
  email: string
  status: string
  subscribedAt: string
  unsubscribedAt: string | null
}

interface Stats {
  total: number
  active: number
  unsubscribed: number
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-[var(--success-muted)] text-[var(--success)]',
    unsubscribed: 'bg-[var(--error-muted)] text-[var(--error)]',
    bounced: 'bg-[var(--warning-muted)] text-[var(--warning)]',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
      {status}
    </span>
  )
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; subscriberId: string | null }>({
    open: false,
    subscriberId: null,
  })

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/subscribers')
      const data = await res.json()

      if (res.ok) {
        setSubscribers(data.subscribers || [])
        setStats(data.stats || { total: 0, active: 0, unsubscribed: 0 })
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/subscribers?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id))
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          active: prev.active - 1,
        }))
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
    }
  }

  const handleExportCSV = () => {
    const filtered = filteredSubscribers
    const headers = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At']
    const rows = filtered.map((s) => [
      s.email,
      s.status,
      new Date(s.subscribedAt).toISOString(),
      s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString() : '',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-sm">Loading subscribers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Newsletter Subscribers</h1>
        <p className="text-[var(--text-secondary)]">Manage your email list and subscriber preferences</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--accent-muted)]">
              <Users className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-sm text-[var(--text-muted)]">Total Subscribers</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--success-muted)]">
              <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.active}</p>
              <p className="text-sm text-[var(--text-muted)]">Active</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--error-muted)]">
              <XCircle className="w-5 h-5 text-[var(--error)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.unsubscribed}</p>
              <p className="text-sm text-[var(--text-muted)]">Unsubscribed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            title="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>

        <Button onClick={handleExportCSV} size="sm" variant="ghost" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Subscribers Table */}
      {filteredSubscribers.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <Mail className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
          <p className="text-[var(--text-secondary)]">
            {search || statusFilter !== 'all' ? 'No subscribers match your filters' : 'No subscribers yet'}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Subscribers will appear here when they sign up via the newsletter form
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-default)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--surface-sunken)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--surface-raised)] divide-y divide-[var(--border-subtle)]">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-[var(--surface-overlay)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-primary)]">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={subscriber.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {formatters.date(subscriber.subscribedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteModal({ open: true, subscriberId: subscriber.id })}
                      className="p-2 text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error-muted)] rounded-md transition-colors"
                      title="Delete subscriber"
                      aria-label="Delete subscriber"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results count */}
      {filteredSubscribers.length > 0 && (
        <p className="text-sm text-[var(--text-muted)]">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, subscriberId: open ? deleteModal.subscriberId : null })}
        title="Delete Subscriber"
        description="Are you sure you want to delete this subscriber? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteModal.subscriberId) {
            handleDelete(deleteModal.subscriberId)
          }
        }}
      />
    </div>
  )
}
