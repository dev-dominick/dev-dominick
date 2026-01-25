'use client'

import { useEffect, useState } from 'react'
import { 
  Scale, FileCheck, Clock, AlertTriangle, 
  CheckCircle, XCircle, DollarSign, FileText,
  MessageSquare, Eye
} from 'lucide-react'
import { Button } from '@/components/ui'
import { formatters } from '@/lib/formatters'

interface ApprovalRequest {
  id: string
  paymentReceiptId: string
  status: string
  requestedAt: string
  assignedRole: string
  notes?: string
  paymentReceipt: {
    id: string
    method: string
    amountCents: number
    clientName?: string
    clientEmail?: string
    description?: string
    status: string
  }
  requestedBy: {
    name?: string
    email: string
  }
  attachments: Array<{
    id: string
    url: string
    filename: string
  }>
}

interface Stats {
  pendingApprovals: number
  approvedThisMonth: number
  rejectedThisMonth: number
  totalValuePending: number
}

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
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 transition-all hover:border-[var(--border-strong)]">
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

export function LawyerDashboard() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [stats, setStats] = useState<Stats>({
    pendingApprovals: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalValuePending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/approvals?status=PENDING')
      if (res.ok) {
        const data = await res.json()
        setApprovals(data.approvals || [])
        
        // Calculate stats
        const pending = data.approvals?.filter((a: ApprovalRequest) => a.status === 'PENDING') || []
        const totalValue = pending.reduce((sum: number, a: ApprovalRequest) => sum + a.paymentReceipt.amountCents, 0)
        
        setStats({
          pendingApprovals: pending.length,
          approvedThisMonth: data.stats?.approvedThisMonth || 0,
          rejectedThisMonth: data.stats?.rejectedThisMonth || 0,
          totalValuePending: totalValue,
        })
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED', decisionNotes: 'Approved by legal review' }),
      })

      if (res.ok) {
        setApprovals(prev => prev.filter(a => a.id !== id))
        setSelectedApproval(null)
        setStats(prev => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
          approvedThisMonth: prev.approvedThisMonth + 1,
        }))
      }
    } catch (error) {
      console.error('Error approving:', error)
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason }),
      })

      if (res.ok) {
        setApprovals(prev => prev.filter(a => a.id !== id))
        setSelectedApproval(null)
        setStats(prev => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
          rejectedThisMonth: prev.rejectedThisMonth + 1,
        }))
      }
    } catch (error) {
      console.error('Error rejecting:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-sm">Loading legal dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Legal Dashboard</h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Review and approve payment receipts requiring legal sign-off
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Pending Approvals" 
          value={stats.pendingApprovals} 
          icon={Clock} 
          accentColor="warning" 
        />
        <StatCard 
          label="Value Pending" 
          value={formatters.currency(stats.totalValuePending / 100)} 
          icon={DollarSign} 
          accentColor="accent" 
        />
        <StatCard 
          label="Approved This Month" 
          value={stats.approvedThisMonth} 
          icon={CheckCircle} 
          accentColor="success" 
        />
        <StatCard 
          label="Rejected This Month" 
          value={stats.rejectedThisMonth} 
          icon={XCircle} 
          accentColor="error" 
        />
      </div>

      {/* Pending Approvals Alert */}
      {stats.pendingApprovals > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--warning)]/30 bg-[var(--warning-muted)] p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                {stats.pendingApprovals} payment{stats.pendingApprovals !== 1 ? 's' : ''} awaiting your review
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Total value: {formatters.currency(stats.totalValuePending / 100)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-default)]">
          <h2 className="font-semibold text-[var(--text-primary)]">Pending Approvals</h2>
        </div>
        
        {approvals.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck className="w-12 h-12 text-[var(--success)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)]">No pending approvals</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">All caught up! ✨</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-default)]">
            {approvals.map(approval => (
              <div 
                key={approval.id}
                className="p-4 hover:bg-[var(--surface-overlay)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-[var(--accent-muted)] text-[var(--accent)]">
                        {approval.paymentReceipt.method}
                      </span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {formatters.currency(approval.paymentReceipt.amountCents / 100)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                      {approval.paymentReceipt.clientName && (
                        <p>Client: {approval.paymentReceipt.clientName}</p>
                      )}
                      <p>Submitted by: {approval.requestedBy.name || approval.requestedBy.email}</p>
                      <p>Submitted: {formatters.datetime(approval.requestedAt)}</p>
                      {approval.paymentReceipt.description && (
                        <p className="text-[var(--text-muted)]">{approval.paymentReceipt.description}</p>
                      )}
                    </div>

                    {approval.attachments.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">
                          {approval.attachments.length} attachment{approval.attachments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedApproval(approval)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[var(--success)] hover:bg-[var(--success)]/90"
                      onClick={() => handleApprove(approval.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[var(--error)] hover:bg-[var(--error-muted)]"
                      onClick={() => handleReject(approval.id, 'Rejected during legal review')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              View All Approved Payments
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Open Messages
            </Button>
          </div>
        </div>
        
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Guidelines</h3>
          <ul className="text-sm text-[var(--text-secondary)] space-y-2">
            <li>• Review all attachments before approval</li>
            <li>• Verify client identity for amounts &gt;$2,500</li>
            <li>• Document rejection reasons for audit trail</li>
            <li>• Contact admin for unusual requests</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
