'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  Building2, 
  RefreshCw, 
  Plus, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { formatters } from '@/lib/formatters'

// Plaid Link script loader
declare global {
  interface Window {
    Plaid?: {
      create: (config: PlaidLinkConfig) => PlaidLinkHandler
    }
  }
}

interface PlaidLinkConfig {
  token: string
  onSuccess: (publicToken: string, metadata: PlaidLinkMetadata) => void
  onExit?: (err: Error | null, metadata: PlaidLinkMetadata) => void
  onLoad?: () => void
}

interface PlaidLinkHandler {
  open: () => void
  exit: (options?: { force: boolean }) => void
  destroy: () => void
}

interface PlaidLinkMetadata {
  institution: {
    name: string
    institution_id: string
  } | null
  accounts: Array<{
    id: string
    name: string
    mask: string
    type: string
    subtype: string
  }>
  link_session_id: string
}

interface PlaidAccount {
  accountId: string
  name: string
  officialName?: string
  type: string
  subtype?: string
  mask?: string
  balanceCurrent?: number
  balanceAvailable?: number
  connectionId?: string
  institutionName?: string
}

interface PlaidConnection {
  id: string
  itemId: string
  institutionId: string
  institutionName: string
  accounts: PlaidAccount[]
  cursor?: string
  lastSync?: string
  status: 'active' | 'error' | 'pending_reauth'
  createdAt: string
  updatedAt: string
}

interface PlaidTransaction {
  id: string
  accountId: string
  connectionId: string
  amount: number
  date: string
  name: string
  merchantName?: string
  category?: string[]
  pending: boolean
  personalFinanceCategory?: {
    primary: string
    detailed: string
  }
}

interface PlaidSummary {
  connections: number
  accounts: PlaidAccount[]
  totalBalance: number
  totalAvailable: number
  last30Days: {
    income: number
    spending: number
    netCashflow: number
    transactionCount: number
    spendingByCategory: Record<string, number>
  }
  recentTransactions: PlaidTransaction[]
}

export default function BankConnectionsPage() {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [connections, setConnections] = useState<PlaidConnection[]>([])
  const [summary, setSummary] = useState<PlaidSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [plaidReady, setPlaidReady] = useState(false)
  const [linkHandler, setLinkHandler] = useState<PlaidLinkHandler | null>(null)
  const [tab, setTab] = useState<'overview' | 'transactions' | 'connections'>('overview')

  // Load Plaid Link script
  useEffect(() => {
    if (document.getElementById('plaid-link-script')) {
      setPlaidReady(!!window.Plaid)
      return
    }

    const script = document.createElement('script')
    script.id = 'plaid-link-script'
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
    script.async = true
    script.onload = () => setPlaidReady(true)
    document.body.appendChild(script)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/plaid')
      if (res.ok) {
        const data = await res.json()
        setConfigured(data.data?.configured ?? false)
        setConnections(data.data?.connections ?? [])
        setSummary(data.data?.summary ?? null)
      }
    } catch (err) {
      console.error('Error fetching Plaid data:', err)
      setError('Failed to load bank connections')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Start Plaid Link flow
  const connectBank = async () => {
    if (!window.Plaid) {
      setError('Plaid Link not loaded')
      return
    }

    setError(null)

    try {
      // Get link token from backend
      const res = await fetch('/api/plaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_link_token' }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create link token')
        return
      }

      const { data } = await res.json()
      const linkToken = data.linkToken

      // Create Plaid Link handler
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
          // Exchange public token for access token
          try {
            const connectRes = await fetch('/api/plaid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'connect',
                publicToken,
                institutionId: metadata.institution?.institution_id,
                institutionName: metadata.institution?.name,
              }),
            })

            if (connectRes.ok) {
              // Refresh data
              fetchData()
            } else {
              const data = await connectRes.json()
              setError(data.error || 'Failed to connect bank')
            }
          } catch {
            setError('Failed to connect bank')
          }
        },
        onExit: (err) => {
          if (err) {
            console.error('Plaid Link exit error:', err)
          }
        },
      })

      setLinkHandler(handler)
      handler.open()
    } catch {
      setError('Failed to start bank connection')
    }
  }

  // Sync transactions for a connection
  const syncConnection = async (connectionId: string) => {
    setSyncing(connectionId)
    try {
      const res = await fetch('/api/plaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', connectionId }),
      })

      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        setError(data.error || 'Sync failed')
      }
    } catch {
      setError('Sync failed')
    } finally {
      setSyncing(null)
    }
  }

  // Disconnect a bank
  const disconnectBank = async (connectionId: string) => {
    if (!confirm('Disconnect this bank? Transaction history will be removed.')) return

    try {
      const res = await fetch('/api/plaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', connectionId }),
      })

      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        setError(data.error || 'Disconnect failed')
      }
    } catch {
      setError('Disconnect failed')
    }
  }

  // Sync all connections
  const syncAll = async () => {
    setSyncing('all')
    try {
      const res = await fetch('/api/plaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch {
      setError('Sync failed')
    } finally {
      setSyncing(null)
    }
  }

  // Cleanup link handler
  useEffect(() => {
    return () => {
      if (linkHandler) {
        linkHandler.destroy()
      }
    }
  }, [linkHandler])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-muted)]">Loading bank connections...</p>
      </div>
    )
  }

  // Not configured state
  if (!configured) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        <div className="p-8 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Plaid Not Configured</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            To connect your real bank accounts, you need Plaid API credentials.
          </p>
          
          <div className="text-left bg-[var(--surface-sunken)] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Setup Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
              <li>Sign up at <a href="https://dashboard.plaid.com/signup" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline">dashboard.plaid.com</a></li>
              <li>Get your Client ID and Secret from the dashboard</li>
              <li>Add to your <code className="bg-[var(--surface-raised)] px-1 rounded">.env.local</code>:</li>
            </ol>
            <pre className="mt-3 bg-[var(--surface-raised)] p-3 rounded text-xs overflow-x-auto">
{`PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox`}
            </pre>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Start with sandbox for testing, then switch to development (free for 100 connections)
            </p>
          </div>

          <Button asChild>
            <a href="https://dashboard.plaid.com/signup" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Get Plaid API Keys
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bank Connections</h1>
          <p className="text-[var(--text-secondary)]">Real-time bank account tracking via Plaid</p>
        </div>
        <div className="flex gap-2">
          {connections.length > 0 && (
            <Button onClick={syncAll} size="sm" variant="ghost" disabled={syncing === 'all'}>
              <RefreshCw className={`w-4 h-4 mr-1 ${syncing === 'all' ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
          )}
          <Button onClick={connectBank} size="sm" disabled={!plaidReady}>
            <Plus className="w-4 h-4 mr-1" />
            Connect Bank
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* No connections state */}
      {connections.length === 0 && (
        <div className="p-12 rounded-lg border border-dashed border-[var(--border-default)] text-center">
          <Building2 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Banks Connected</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Connect your Fulton Bank, Wells Fargo, or any other bank to automatically track transactions.
          </p>
          <Button onClick={connectBank} disabled={!plaidReady}>
            <Plus className="w-4 h-4 mr-2" />
            Connect Your First Bank
          </Button>
        </div>
      )}

      {/* Dashboard when connected */}
      {connections.length > 0 && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-[var(--accent)]" />
                <p className="text-xs text-[var(--text-muted)]">Total Balance</p>
              </div>
              <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {formatters.currency(summary.totalBalance)}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft className="w-4 h-4 text-green-400" />
                <p className="text-xs text-[var(--text-muted)]">Income (30d)</p>
              </div>
              <p className="text-2xl font-bold font-mono text-green-400">
                {formatters.currency(summary.last30Days.income)}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="w-4 h-4 text-red-400" />
                <p className="text-xs text-[var(--text-muted)]">Spending (30d)</p>
              </div>
              <p className="text-2xl font-bold font-mono text-red-400">
                {formatters.currency(summary.last30Days.spending)}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
              <div className="flex items-center gap-2 mb-1">
                {summary.last30Days.netCashflow >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <p className="text-xs text-[var(--text-muted)]">Net Cash Flow</p>
              </div>
              <p className={`text-2xl font-bold font-mono ${summary.last30Days.netCashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatters.currency(summary.last30Days.netCashflow)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[var(--border-default)]">
            <button
              onClick={() => setTab('overview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === 'overview'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab('transactions')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === 'transactions'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Transactions ({summary.last30Days.transactionCount})
            </button>
            <button
              onClick={() => setTab('connections')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === 'connections'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Connections ({connections.length})
            </button>
          </div>

          {/* Overview Tab */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accounts */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Accounts</h3>
                <div className="space-y-2">
                  {summary.accounts.map((account) => (
                    <div 
                      key={account.accountId} 
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          account.type === 'depository' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                        }`}>
                          {account.type === 'depository' ? (
                            <Building2 className="w-5 h-5 text-blue-400" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{account.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {account.institutionName} • ****{account.mask}
                          </p>
                        </div>
                      </div>
                      <p className={`font-mono font-semibold ${(account.balanceCurrent || 0) < 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                        {formatters.currency(account.balanceCurrent || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spending by Category */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Spending by Category (30d)</h3>
                <div className="space-y-2">
                  {Object.entries(summary.last30Days.spendingByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-raised)]">
                        <span className="text-[var(--text-secondary)]">{category}</span>
                        <span className="font-mono text-red-400">{formatters.currency(amount)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {tab === 'transactions' && (
            <div className="space-y-2">
              {summary.recentTransactions.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-8">No transactions synced yet</p>
              ) : (
                summary.recentTransactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.amount < 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {tx.amount < 0 ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {tx.merchantName || tx.name}
                          {tx.pending && <span className="ml-2 text-xs text-yellow-400">(Pending)</span>}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {tx.date} • {tx.personalFinanceCategory?.primary || tx.category?.[0] || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <p className={`font-mono font-semibold ${tx.amount < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount < 0 ? '+' : '-'}{formatters.currency(Math.abs(tx.amount))}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Connections Tab */}
          {tab === 'connections' && (
            <div className="space-y-4">
              {connections.map((conn) => (
                <div 
                  key={conn.id}
                  className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-8 h-8 text-[var(--accent)]" />
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{conn.institutionName}</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {conn.accounts.length} account{conn.accounts.length !== 1 ? 's' : ''} • 
                          Last sync: {conn.lastSync ? new Date(conn.lastSync).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {conn.status === 'active' && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {conn.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                      {conn.status === 'pending_reauth' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => syncConnection(conn.id)}
                        disabled={syncing === conn.id}
                      >
                        <RefreshCw className={`w-4 h-4 ${syncing === conn.id ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => disconnectBank(conn.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Accounts in this connection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {conn.accounts.map((account) => (
                      <div key={account.accountId} className="flex items-center justify-between p-2 rounded bg-[var(--surface-sunken)]">
                        <span className="text-sm text-[var(--text-secondary)]">
                          {account.name} {account.mask && `(****${account.mask})`}
                        </span>
                        <span className="font-mono text-sm">{formatters.currency(account.balanceCurrent || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button onClick={connectBank} variant="secondary" className="w-full" disabled={!plaidReady}>
                <Plus className="w-4 h-4 mr-2" />
                Add Another Bank
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
