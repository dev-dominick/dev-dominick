'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DollarSign, ArrowRight, CheckCircle, Loader2, Wallet, ArrowUpRight, ArrowDownLeft, Banknote, RefreshCw } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { formatters } from '@/lib/formatters'

type TransactionType = 'CASH' | 'OWNER_DRAW' | 'CAPITAL_CONTRIBUTION' | 'DEPOSIT_TO_BANK'

const TX_TYPES: { value: TransactionType; label: string; icon: 'in' | 'out' | 'bank'; desc: string; action: string }[] = [
  { value: 'CASH', label: 'Cash Income', icon: 'in', desc: 'Client paid cash', action: 'cash_income' },
  { value: 'OWNER_DRAW', label: 'Owner Draw', icon: 'out', desc: 'Pay yourself', action: 'owner_draw' },
  { value: 'CAPITAL_CONTRIBUTION', label: 'Capital In', icon: 'in', desc: 'Add personal funds', action: 'capital_contribution' },
  { value: 'DEPOSIT_TO_BANK', label: 'Deposit', icon: 'bank', desc: 'Cash to Fulton', action: 'deposit_to_bank' },
]

interface CashPosition {
  bankBalance: number
  cashOnHand: number
  krakenBalance: number
  totalLiquid: number
}

interface TreasuryWidgetProps {
  onPaymentRecorded?: () => void
}

export function TreasuryWidget({ onPaymentRecorded }: TreasuryWidgetProps) {
  const [showForm, setShowForm] = useState(false)
  const [txType, setTxType] = useState<TransactionType>('CASH')
  const [amount, setAmount] = useState('')
  const [clientName, setClientName] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cashPosition, setCashPosition] = useState<CashPosition | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch cash position from internal ledger
  const fetchLedger = async () => {
    try {
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setCashPosition(data.data?.cashPosition || null)
      }
    } catch {
      // Ignore errors, will show loading state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLedger()
  }, [])

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Use internal ledger API
      const txConfig = TX_TYPES.find(t => t.value === txType)
      const res = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: txConfig?.action || 'cash_income',
          amountUsd: parseFloat(amount),
          clientName: txType === 'CASH' ? (clientName || undefined) : undefined,
          note: note || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to record')
        return
      }

      const data = await res.json()
      
      // Update cash position from response
      if (data.data?.summary?.cashPosition) {
        setCashPosition(data.data.summary.cashPosition)
      }

      const typeLabel = txConfig?.label || 'Payment'
      setSuccessMsg(`${typeLabel} recorded!`)
      setSuccess(true)
      setAmount('')
      setClientName('')
      setNote('')
      onPaymentRecorded?.()

      // Reset success after 2s
      setTimeout(() => {
        setSuccess(false)
        setShowForm(false)
      }, 2000)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Treasury</h3>
            <p className="text-xs text-[var(--text-muted)]">Internal Ledger</p>
          </div>
        </div>
        <button onClick={fetchLedger} title="Refresh balances" className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cash Position Summary */}
      {cashPosition && (
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg bg-[var(--surface-sunken)]">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Fulton Bank</p>
            <p className={`text-sm font-mono font-semibold ${cashPosition.bankBalance < 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
              {formatters.currency(cashPosition.bankBalance)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Cash on Hand</p>
            <p className="text-sm font-mono font-semibold text-green-400">
              {formatters.currency(cashPosition.cashOnHand)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Kraken</p>
            <p className="text-sm font-mono font-semibold text-blue-400">
              {formatters.currency(cashPosition.krakenBalance)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Total Liquid</p>
            <p className={`text-sm font-mono font-semibold ${cashPosition.totalLiquid < 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
              {formatters.currency(cashPosition.totalLiquid)}
            </p>
          </div>
        </div>
      )}

      {!showForm ? (
        <div className="space-y-2">
          <Button
            onClick={() => { setTxType('CASH'); setShowForm(true) }}
            className="w-full justify-start"
            variant="secondary"
          >
            <ArrowDownLeft className="w-4 h-4 mr-2 text-green-400" />
            Log Cash Income
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => { setTxType('DEPOSIT_TO_BANK'); setShowForm(true) }}
              className="flex-1 justify-start"
              variant="ghost"
            >
              <Banknote className="w-4 h-4 mr-1.5 text-blue-400" />
              Deposit
            </Button>
            <Button
              onClick={() => { setTxType('OWNER_DRAW'); setShowForm(true) }}
              className="flex-1 justify-start"
              variant="ghost"
            >
              <ArrowUpRight className="w-4 h-4 mr-1.5 text-orange-400" />
              Draw
            </Button>
          </div>
          <Link href="/app/treasury" className="block">
            <Button variant="ghost" size="sm" className="w-full text-[var(--accent)]">
              Full Treasury <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      ) : success ? (
        <div className="flex items-center justify-center gap-2 py-4 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{successMsg}</span>
        </div>
      ) : (
        <form onSubmit={handleQuickLog} className="space-y-3">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          
          {/* Transaction Type Pills */}
          <div className="flex flex-wrap gap-1.5">
            {TX_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTxType(t.value)}
                className={`flex-1 min-w-[70px] px-2 py-1.5 text-[10px] rounded-lg font-medium transition-colors ${
                  txType === t.value
                    ? t.value === 'OWNER_DRAW' 
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                      : t.value === 'DEPOSIT_TO_BANK'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                      : 'bg-green-500/20 text-green-300 border border-green-500/50'
                    : 'bg-[var(--surface-sunken)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {t.value === 'CASH' && <ArrowDownLeft className="w-3 h-3 inline mr-0.5" />}
                {t.value === 'OWNER_DRAW' && <ArrowUpRight className="w-3 h-3 inline mr-0.5" />}
                {t.value === 'CAPITAL_CONTRIBUTION' && <Wallet className="w-3 h-3 inline mr-0.5" />}
                {t.value === 'DEPOSIT_TO_BANK' && <Banknote className="w-3 h-3 inline mr-0.5" />}
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="Amount ($)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            {txType === 'CASH' && (
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Client (optional)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            )}
          </div>

          {/* Optional note */}
          <Input
            type="text"
            placeholder={txType === 'OWNER_DRAW' ? 'Note: e.g. Fund Kraken' : 'Note (optional)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-9 text-sm"
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {txType === 'OWNER_DRAW' ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <DollarSign className="w-4 h-4 mr-1" />
                  )}
                  Log {amount ? formatters.currency(parseFloat(amount)) : TX_TYPES.find(t => t.value === txType)?.label}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setError(null)
                setNote('')
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
