'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Building2,
  ArrowRight,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { formatters } from '@/lib/formatters'

interface PlaidAccount {
  accountId: string
  name: string
  type: string
  subtype?: string
  mask?: string
  balanceCurrent?: number
  balanceAvailable?: number
}

interface PlaidConnection {
  id: string
  institutionName: string
  accounts: PlaidAccount[]
  status: 'active' | 'error' | 'pending_reauth'
  lastSync?: string
}

interface PlaidSummary {
  connections: PlaidConnection[]
  totalBalance: number
  accountCount: number
  lastSync: string | null
  needsAttention: number
}

interface BanksWidgetProps {
  onConnectClick?: () => void
}

export function BanksWidget({ onConnectClick }: BanksWidgetProps) {
  const [summary, setSummary] = useState<PlaidSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/plaid')
      if (res.ok) {
        const data = await res.json()
        setSummary(data.data)
        setError(null)
      } else {
        setError('Failed to load bank data')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const handleSync = async () => {
    if (!summary?.connections.length) return
    
    setSyncing(true)
    try {
      // Sync all connections
      for (const conn of summary.connections) {
        await fetch('/api/plaid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync', connectionId: conn.id }),
        })
      }
      await fetchSummary()
    } catch {
      setError('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const hasConnections = summary && summary.connections.length > 0

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Connected Banks</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {hasConnections
                ? `${summary.accountCount} account${summary.accountCount !== 1 ? 's' : ''} linked`
                : 'No accounts linked'}
            </p>
          </div>
        </div>
        {hasConnections && (
          <button
            onClick={handleSync}
            disabled={syncing}
            title="Sync all accounts"
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${syncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm mb-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* No Connections State */}
      {!loading && !error && !hasConnections && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-[var(--surface-sunken)] text-center">
            <CreditCard className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              Connect your bank accounts
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Track transactions automatically like Monarch
            </p>
          </div>
          <Link href="/app/banks" className="block">
            <Button className="w-full" variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Connect Bank
            </Button>
          </Link>
        </div>
      )}

      {/* Connected Accounts Summary */}
      {!loading && !error && hasConnections && (
        <div className="space-y-3">
          {/* Total Balance */}
          <div className="p-3 rounded-lg bg-[var(--surface-sunken)]">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">
              Total Balance
            </p>
            <p className={`text-xl font-mono font-bold ${
              summary.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatters.currency(summary.totalBalance)}
            </p>
            {summary.lastSync && (
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Last sync: {formatters.timeago(summary.lastSync)}
              </p>
            )}
          </div>

          {/* Connections List */}
          <div className="space-y-2">
            {summary.connections.slice(0, 3).map((conn) => (
              <div
                key={conn.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-overlay)]"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    conn.status === 'active' ? 'bg-green-400' :
                    conn.status === 'error' ? 'bg-red-400' :
                    'bg-yellow-400'
                  }`} />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {conn.institutionName}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {conn.accounts.length} acct{conn.accounts.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
            {summary.connections.length > 3 && (
              <p className="text-xs text-[var(--text-muted)] text-center">
                +{summary.connections.length - 3} more
              </p>
            )}
          </div>

          {/* Attention Badge */}
          {summary.needsAttention > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{summary.needsAttention} connection{summary.needsAttention > 1 ? 's' : ''} need attention</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link href="/app/banks" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full text-[var(--accent)]">
                Manage Banks <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
