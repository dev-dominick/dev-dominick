'use client'

import { useEffect, useState } from 'react'
import { 
  Settings, Truck, Clock, CheckCircle, 
  AlertTriangle, ArrowRight, Building, RefreshCw,
  DollarSign, Send, FileText, Plus, Wallet
} from 'lucide-react'
import { Button, Input, Textarea } from '@/components/ui'
import { formatters } from '@/lib/formatters'

interface PaymentReceipt {
  id: string
  method: string
  amountCents: number
  status: string
  clientName?: string
  clientEmail?: string
  description?: string
  receivedAt?: string
  createdAt: string
  approvalRequest?: {
    status: string
  }
}

interface TreasuryTransfer {
  id: string
  sourceAccount: string
  destinationAccount: string
  method: string
  amountCents: number
  status: string
  plannedAt: string
  submittedAt?: string
  confirmedAt?: string
  bankRef?: string
  krakenRef?: string
  notes?: string
}

interface Stats {
  pendingPayments: number
  approvedPayments: number
  plannedTransfers: number
  submittedTransfers: number
  confirmedTransfers: number
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

export function OpsDashboard() {
  const [payments, setPayments] = useState<PaymentReceipt[]>([])
  const [transfers, setTransfers] = useState<TreasuryTransfer[]>([])
  const [stats, setStats] = useState<Stats>({
    pendingPayments: 0,
    approvedPayments: 0,
    plannedTransfers: 0,
    submittedTransfers: 0,
    confirmedTransfers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'payments' | 'transfers'>('payments')
  const [showRecordPayment, setShowRecordPayment] = useState(false)
  const [showPlanTransfer, setShowPlanTransfer] = useState(false)

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    method: 'CASH',
    amountCents: '',
    clientName: '',
    clientEmail: '',
    description: '',
    notes: '',
  })

  const [transferForm, setTransferForm] = useState({
    sourceAccount: 'FULTON_BANK',
    destinationAccount: 'KRAKEN',
    method: 'ACH',
    amountCents: '',
    notes: '',
    paymentReceiptId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [paymentsRes, transfersRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/treasury/transfers'),
      ])

      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        const receipts = data.receipts || []
        setPayments(receipts)
        
        setStats(prev => ({
          ...prev,
          pendingPayments: receipts.filter((p: PaymentReceipt) => 
            p.status === 'PENDING' || p.status === 'PENDING_APPROVAL'
          ).length,
          approvedPayments: receipts.filter((p: PaymentReceipt) => 
            p.status === 'APPROVED' || p.status === 'RECEIVED'
          ).length,
        }))
      }

      if (transfersRes.ok) {
        const data = await transfersRes.json()
        const transfersList = data.transfers || []
        setTransfers(transfersList)
        
        setStats(prev => ({
          ...prev,
          plannedTransfers: transfersList.filter((t: TreasuryTransfer) => t.status === 'PLANNED').length,
          submittedTransfers: transfersList.filter((t: TreasuryTransfer) => t.status === 'SUBMITTED').length,
          confirmedTransfers: transfersList.filter((t: TreasuryTransfer) => t.status === 'CONFIRMED').length,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch ops data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          amountCents: Math.round(parseFloat(paymentForm.amountCents) * 100),
        }),
      })

      if (res.ok) {
        setShowRecordPayment(false)
        setPaymentForm({
          method: 'CASH',
          amountCents: '',
          clientName: '',
          clientEmail: '',
          description: '',
          notes: '',
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error recording payment:', error)
    }
  }

  const handlePlanTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/treasury/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transferForm,
          amountCents: Math.round(parseFloat(transferForm.amountCents) * 100),
        }),
      })

      if (res.ok) {
        setShowPlanTransfer(false)
        setTransferForm({
          sourceAccount: 'FULTON_BANK',
          destinationAccount: 'KRAKEN',
          method: 'ACH',
          amountCents: '',
          notes: '',
          paymentReceiptId: '',
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error planning transfer:', error)
    }
  }

  const handleTransferAction = async (id: string, action: 'submit' | 'confirm' | 'cancel', bankRef?: string, krakenRef?: string) => {
    try {
      const body: Record<string, string> = {}
      
      if (action === 'submit') {
        body.status = 'SUBMITTED'
        if (bankRef) body.bankRef = bankRef
      } else if (action === 'confirm') {
        body.status = 'CONFIRMED'
        if (krakenRef) body.krakenRef = krakenRef
      } else if (action === 'cancel') {
        body.status = 'CANCELED'
      }

      const res = await fetch(`/api/treasury/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error updating transfer:', error)
    }
  }

  const handleRequestApproval = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}/request-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedRole: 'LAWYER' }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error requesting approval:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-sm">Loading operations dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Operations Dashboard</h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Manage payments, approvals, and treasury transfers
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowRecordPayment(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
          <Button variant="outline" onClick={() => setShowPlanTransfer(true)}>
            <Send className="w-4 h-4 mr-2" />
            Plan Transfer
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Pending Payments" value={stats.pendingPayments} icon={Clock} accentColor="warning" />
        <StatCard label="Approved" value={stats.approvedPayments} icon={CheckCircle} accentColor="success" />
        <StatCard label="Planned Transfers" value={stats.plannedTransfers} icon={FileText} accentColor="accent" />
        <StatCard label="Submitted" value={stats.submittedTransfers} icon={Send} accentColor="warning" />
        <StatCard label="Confirmed" value={stats.confirmedTransfers} icon={CheckCircle} accentColor="success" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-default)]">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Payments ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transfers'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Transfers ({transfers.length})
        </button>
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)]">No payments recorded</p>
              <Button onClick={() => setShowRecordPayment(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Record First Payment
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-default)]">
              {payments.map(payment => (
                <div key={payment.id} className="p-4 hover:bg-[var(--surface-overlay)] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-[var(--accent-muted)] text-[var(--accent)]">
                          {payment.method}
                        </span>
                        <span className="text-lg font-bold text-[var(--text-primary)]">
                          {formatters.currency(payment.amountCents / 100)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'APPROVED' || payment.status === 'RECEIVED'
                            ? 'bg-[var(--success-muted)] text-[var(--success)]'
                            : payment.status === 'PENDING_APPROVAL'
                            ? 'bg-[var(--warning-muted)] text-[var(--warning)]'
                            : payment.status === 'REJECTED'
                            ? 'bg-[var(--error-muted)] text-[var(--error)]'
                            : 'bg-[var(--surface-overlay)] text-[var(--text-muted)]'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                        {payment.clientName && <p>Client: {payment.clientName}</p>}
                        <p>Created: {formatters.datetime(payment.createdAt)}</p>
                        {payment.description && (
                          <p className="text-[var(--text-muted)]">{payment.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {payment.status === 'PENDING' && payment.method === 'CASH' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestApproval(payment.id)}
                        >
                          Request Approval
                        </Button>
                      )}
                      {(payment.status === 'APPROVED' || payment.status === 'RECEIVED') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTransferForm(prev => ({
                              ...prev,
                              amountCents: (payment.amountCents / 100).toString(),
                              paymentReceiptId: payment.id,
                            }))
                            setShowPlanTransfer(true)
                          }}
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Create Transfer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] overflow-hidden">
          {transfers.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)]">No transfers planned</p>
              <Button onClick={() => setShowPlanTransfer(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Plan First Transfer
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-default)]">
              {transfers.map(transfer => (
                <div key={transfer.id} className="p-4 hover:bg-[var(--surface-overlay)] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="font-medium text-[var(--text-primary)]">
                            {transfer.sourceAccount}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="font-medium text-[var(--text-primary)]">
                            {transfer.destinationAccount}
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-[var(--surface-overlay)] text-[var(--text-muted)]">
                          {transfer.method}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-xl font-bold text-[var(--text-primary)]">
                          {formatters.currency(transfer.amountCents / 100)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          transfer.status === 'CONFIRMED'
                            ? 'bg-[var(--success-muted)] text-[var(--success)]'
                            : transfer.status === 'SUBMITTED'
                            ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                            : transfer.status === 'CANCELED'
                            ? 'bg-[var(--error-muted)] text-[var(--error)]'
                            : 'bg-[var(--warning-muted)] text-[var(--warning)]'
                        }`}>
                          {transfer.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                        <p>Planned: {formatters.datetime(transfer.plannedAt)}</p>
                        {transfer.submittedAt && (
                          <p>Submitted: {formatters.datetime(transfer.submittedAt)}</p>
                        )}
                        {transfer.confirmedAt && (
                          <p>Confirmed: {formatters.datetime(transfer.confirmedAt)}</p>
                        )}
                        {transfer.bankRef && <p>Bank Ref: {transfer.bankRef}</p>}
                        {transfer.krakenRef && <p>Kraken Ref: {transfer.krakenRef}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {transfer.status === 'PLANNED' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleTransferAction(transfer.id, 'submit')}
                          >
                            Mark Submitted
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[var(--error)]"
                            onClick={() => handleTransferAction(transfer.id, 'cancel')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {transfer.status === 'SUBMITTED' && (
                        <Button
                          size="sm"
                          className="bg-[var(--success)] hover:bg-[var(--success)]/90"
                          onClick={() => handleTransferAction(transfer.id, 'confirm')}
                        >
                          Mark Confirmed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface-raised)] rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)]"
                >
                  <option value="CASH">Cash</option>
                  <option value="ACH">ACH</option>
                  <option value="WIRE">Wire</option>
                  <option value="CHECK">Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Amount ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentForm.amountCents}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amountCents: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Client Name
                </label>
                <Input
                  value={paymentForm.clientName}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Description
                </label>
                <Textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Payment description"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowRecordPayment(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Transfer Modal */}
      {showPlanTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface-raised)] rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Plan Transfer</h2>
            <form onSubmit={handlePlanTransfer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    From
                  </label>
                  <select
                    value={transferForm.sourceAccount}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, sourceAccount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)]"
                  >
                    <option value="FULTON_BANK">Fulton Bank</option>
                    <option value="CASH_ON_HAND">Cash on Hand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    To
                  </label>
                  <select
                    value={transferForm.destinationAccount}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, destinationAccount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)]"
                  >
                    <option value="KRAKEN">Kraken</option>
                    <option value="COINBASE">Coinbase</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Method
                </label>
                <select
                  value={transferForm.method}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)]"
                >
                  <option value="ACH">ACH</option>
                  <option value="WIRE">Wire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Amount ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={transferForm.amountCents}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, amountCents: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Notes
                </label>
                <Textarea
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Transfer notes"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowPlanTransfer(false)}>
                  Cancel
                </Button>
                <Button type="submit">Plan Transfer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
