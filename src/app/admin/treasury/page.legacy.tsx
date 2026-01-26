'use client'

import { useEffect, useState } from 'react'
import { DollarSign, ArrowRight, CheckCircle, Clock, XCircle, Plus, Send, Building2, Banknote } from 'lucide-react'
import { Button, Input, Textarea } from '@/components/ui'
import { formatters } from '@/lib/formatters'

interface PaymentReceipt {
  id: string
  method: string
  amountUsd: number
  status: string
  receivedAt: string | null
  clientName: string | null
  clientEmail: string | null
  description: string | null
  notes: string | null
  externalRef: string | null
  createdAt: string
  treasuryTransfers: Array<{
    id: string
    status: string
    amountCents: number
    destinationAccount: string
  }>
}

interface TreasuryTransfer {
  id: string
  sourceAccount: string
  destinationAccount: string
  method: string
  amountUsd: number
  status: string
  plannedAt: string
  submittedAt: string | null
  confirmedAt: string | null
  bankRef: string | null
  krakenRef: string | null
  notes: string | null
  paymentReceipt: {
    id: string
    method: string
    amountCents: number
    clientName: string | null
  } | null
}

interface Summary {
  totalReceived: number
  totalPending: number
  byMethod: Record<string, { count: number; amountUsd: number }>
}

interface TransferSummary {
  planned: number
  submitted: number
  confirmed: number
}

const METHOD_COLORS: Record<string, string> = {
  CASH: 'bg-green-500/20 text-green-400',
  STRIPE: 'bg-purple-500/20 text-purple-400',
  ACH: 'bg-blue-500/20 text-blue-400',
  WIRE: 'bg-yellow-500/20 text-yellow-400',
  CHECK: 'bg-orange-500/20 text-orange-400',
  OTHER: 'bg-gray-500/20 text-gray-400',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  RECEIVED: <CheckCircle className="w-4 h-4 text-green-400" />,
  PENDING: <Clock className="w-4 h-4 text-yellow-400" />,
  FAILED: <XCircle className="w-4 h-4 text-red-400" />,
  REFUNDED: <XCircle className="w-4 h-4 text-orange-400" />,
  PLANNED: <Clock className="w-4 h-4 text-blue-400" />,
  SUBMITTED: <Send className="w-4 h-4 text-yellow-400" />,
  CONFIRMED: <CheckCircle className="w-4 h-4 text-green-400" />,
  CANCELED: <XCircle className="w-4 h-4 text-red-400" />,
}

export default function TreasuryPage() {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([])
  const [transfers, setTransfers] = useState<TreasuryTransfer[]>([])
  const [summary, setSummary] = useState<Summary>({ totalReceived: 0, totalPending: 0, byMethod: {} })
  const [transferSummary, setTransferSummary] = useState<TransferSummary>({ planned: 0, submitted: 0, confirmed: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'receipts' | 'transfers'>('receipts')
  
  // Forms
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amountUsd: '',
    method: 'CASH',
    clientName: '',
    clientEmail: '',
    notes: '',
    externalRef: '',
  })
  const [transferForm, setTransferForm] = useState({
    amountUsd: '',
    sourceAccount: 'FULTON_BANK',
    method: 'ACH',
    notes: '',
    paymentReceiptId: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [receiptsRes, transfersRes] = await Promise.all([
        fetch('/api/payments?limit=100'),
        fetch('/api/treasury/transfers?limit=100'),
      ])
      
      if (receiptsRes.ok) {
        const receiptsData = await receiptsRes.json()
        setReceipts(receiptsData.receipts || [])
        setSummary(receiptsData.summary || { totalReceived: 0, totalPending: 0, byMethod: {} })
      }
      
      if (transfersRes.ok) {
        const transfersData = await transfersRes.json()
        setTransfers(transfersData.transfers || [])
        setTransferSummary(transfersData.summary || { planned: 0, submitted: 0, confirmed: 0 })
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: parseFloat(paymentForm.amountUsd),
          method: paymentForm.method,
          clientName: paymentForm.clientName || undefined,
          clientEmail: paymentForm.clientEmail || undefined,
          notes: paymentForm.notes || undefined,
          externalRef: paymentForm.externalRef || undefined,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Failed to create payment')
        return
      }
      
      setShowPaymentForm(false)
      setPaymentForm({ amountUsd: '', method: 'CASH', clientName: '', clientEmail: '', notes: '', externalRef: '' })
      fetchData()
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch('/api/treasury/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: parseFloat(transferForm.amountUsd),
          sourceAccount: transferForm.sourceAccount,
          method: transferForm.method,
          notes: transferForm.notes || undefined,
          paymentReceiptId: transferForm.paymentReceiptId || undefined,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Failed to create transfer')
        return
      }
      
      setShowTransferForm(false)
      setTransferForm({ amountUsd: '', sourceAccount: 'FULTON_BANK', method: 'ACH', notes: '', paymentReceiptId: '' })
      fetchData()
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTransferStatus = async (id: string, status: string, refs?: { bankRef?: string; krakenRef?: string }) => {
    try {
      const res = await fetch(`/api/treasury/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...refs }),
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Error updating transfer:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-sm">Loading treasury data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Treasury & Payments</h1>
          <p className="text-[var(--text-secondary)]">Track all payments and Kraken funding transfers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setShowPaymentForm(true); setError(null); }} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Record Payment
          </Button>
          <Button onClick={() => { setShowTransferForm(true); setError(null); }} size="sm" variant="secondary">
            <Building2 className="w-4 h-4 mr-1" /> Plan Transfer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Total Received</p>
          <p className="text-2xl font-bold text-green-400">{formatters.currency(summary.totalReceived)}</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{formatters.currency(summary.totalPending)}</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Planned Transfers</p>
          <p className="text-2xl font-bold text-blue-400">{formatters.currency(transferSummary.planned)}</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Confirmed to Kraken</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{formatters.currency(transferSummary.confirmed)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-default)]">
        <button
          onClick={() => setTab('receipts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'receipts'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Banknote className="w-4 h-4 inline mr-2" />
          Payment Receipts ({receipts.length})
        </button>
        <button
          onClick={() => setTab('transfers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'transfers'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Kraken Transfers ({transfers.length})
        </button>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface-raised)] rounded-lg p-6 w-full max-w-md border border-[var(--border-default)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Record Cash/Manual Payment</h2>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Amount (USD) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={paymentForm.amountUsd}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountUsd: e.target.value })}
                  placeholder="10000.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Method *</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="CASH">💵 Cash</option>
                  <option value="ACH">🏦 ACH Transfer</option>
                  <option value="WIRE">⚡ Wire Transfer</option>
                  <option value="CHECK">📝 Check</option>
                  <option value="OTHER">📋 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Client Name</label>
                <Input
                  value={paymentForm.clientName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, clientName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Client Email</label>
                <Input
                  type="email"
                  value={paymentForm.clientEmail}
                  onChange={(e) => setPaymentForm({ ...paymentForm, clientEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Reference # (check number, bank ref, etc.)</label>
                <Input
                  value={paymentForm.externalRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, externalRef: e.target.value })}
                  placeholder="CHK-12345"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label>
                <Textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Payment details, context..."
                  textareaSize="sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record Payment'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface-raised)] rounded-lg p-6 w-full max-w-md border border-[var(--border-default)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Plan Kraken Transfer</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              This creates a planned transfer. You&apos;ll manually execute it in Fulton Bank, then mark it as submitted/confirmed here.
            </p>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Amount (USD) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={transferForm.amountUsd}
                  onChange={(e) => setTransferForm({ ...transferForm, amountUsd: e.target.value })}
                  placeholder="10000.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Source Account *</label>
                <select
                  value={transferForm.sourceAccount}
                  onChange={(e) => setTransferForm({ ...transferForm, sourceAccount: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="FULTON_BANK">🏦 Fulton Bank</option>
                  <option value="CASH_ON_HAND">💵 Cash on Hand</option>
                  <option value="STRIPE_BALANCE">💳 Stripe Balance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Transfer Method *</label>
                <select
                  value={transferForm.method}
                  onChange={(e) => setTransferForm({ ...transferForm, method: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="ACH">ACH (2-3 days)</option>
                  <option value="WIRE">Wire (same day)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Link to Payment Receipt (optional)</label>
                <select
                  value={transferForm.paymentReceiptId}
                  onChange={(e) => setTransferForm({ ...transferForm, paymentReceiptId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="">-- None --</option>
                  {receipts.filter(r => r.status === 'RECEIVED').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.method} - {formatters.currency(r.amountUsd)} {r.clientName ? `(${r.clientName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label>
                <Textarea
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  placeholder="Transfer purpose, context..."
                  textareaSize="sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Plan Transfer'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowTransferForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipts Tab */}
      {tab === 'receipts' && (
        <div className="space-y-3">
          {receipts.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <DollarSign className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)]">No payment receipts yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Record cash payments or they&apos;ll appear automatically from Stripe</p>
            </div>
          ) : (
            receipts.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] hover:border-[var(--border-strong)] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1.5 rounded-md text-xs font-medium ${METHOD_COLORS[r.method] || METHOD_COLORS.OTHER}`}>
                      {r.method}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-[var(--text-primary)]">
                        {formatters.currency(r.amountUsd)}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {r.clientName || r.description || 'No description'}
                      </p>
                      {r.clientEmail && (
                        <p className="text-xs text-[var(--text-muted)]">{r.clientEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      {STATUS_ICONS[r.status]}
                      <span className="text-sm font-medium">{r.status}</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {r.receivedAt ? formatters.datetime(r.receivedAt) : formatters.timeago(r.createdAt)}
                    </span>
                    {r.externalRef && (
                      <span className="text-xs text-[var(--text-muted)]">Ref: {r.externalRef}</span>
                    )}
                  </div>
                </div>
                {r.notes && (
                  <p className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-sm text-[var(--text-muted)] italic">
                    {r.notes}
                  </p>
                )}
                {r.treasuryTransfers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-muted)] mb-2">Linked transfers:</p>
                    <div className="flex gap-2 flex-wrap">
                      {r.treasuryTransfers.map(t => (
                        <span key={t.id} className="px-2 py-1 bg-[var(--accent-muted)] text-[var(--accent)] text-xs rounded">
                          {t.destinationAccount} - {t.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Transfers Tab */}
      {tab === 'transfers' && (
        <div className="space-y-3">
          {transfers.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)]">No Kraken transfers yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Plan a transfer to move funds from Fulton Bank to Kraken</p>
            </div>
          ) : (
            transfers.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] hover:border-[var(--border-strong)] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-muted)]">{t.sourceAccount.replace(/_/g, ' ')}</span>
                    <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-sm font-medium text-[var(--accent)]">{t.destinationAccount}</span>
                    <span className="px-2 py-0.5 bg-[var(--surface-overlay)] rounded text-xs text-[var(--text-muted)]">
                      {t.method}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {STATUS_ICONS[t.status]}
                    <span className="text-sm font-medium">{t.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-xl text-[var(--text-primary)]">{formatters.currency(t.amountUsd)}</p>
                    <div className="text-xs text-[var(--text-muted)] space-y-0.5 mt-1">
                      <p>Planned: {formatters.datetime(t.plannedAt)}</p>
                      {t.submittedAt && <p>Submitted: {formatters.datetime(t.submittedAt)}</p>}
                      {t.confirmedAt && <p>Confirmed: {formatters.datetime(t.confirmedAt)}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {t.status === 'PLANNED' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateTransferStatus(t.id, 'SUBMITTED')}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Mark Submitted
                      </Button>
                    )}
                    {t.status === 'SUBMITTED' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUpdateTransferStatus(t.id, 'CONFIRMED')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Confirmed
                      </Button>
                    )}
                    {(t.status === 'PLANNED' || t.status === 'SUBMITTED') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-500/10"
                        onClick={() => handleUpdateTransferStatus(t.id, 'CANCELED')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {(t.bankRef || t.krakenRef || t.notes) && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-1">
                    {t.bankRef && <p>Bank Ref: {t.bankRef}</p>}
                    {t.krakenRef && <p>Kraken Ref: {t.krakenRef}</p>}
                    {t.notes && <p className="italic">{t.notes}</p>}
                  </div>
                )}

                {t.paymentReceipt && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-muted)]">
                      Linked payment: {t.paymentReceipt.method} - {formatters.currency(t.paymentReceipt.amountCents / 100)}
                      {t.paymentReceipt.clientName && ` (${t.paymentReceipt.clientName})`}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
