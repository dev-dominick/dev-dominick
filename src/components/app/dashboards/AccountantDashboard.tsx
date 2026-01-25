'use client'

import { useEffect, useState } from 'react'
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, 
  FileText, PieChart, BarChart3, Download,
  Receipt, CreditCard, Wallet, Building
} from 'lucide-react'
import { Button } from '@/components/ui'
import { formatters } from '@/lib/formatters'

interface FinancialSummary {
  totalReceived: number
  totalPending: number
  totalTransferred: number
  cashReceived: number
  stripeReceived: number
  achWireReceived: number
}

interface RecentPayment {
  id: string
  method: string
  amountCents: number
  status: string
  clientName?: string
  receivedAt?: string
  createdAt: string
}

interface RecentTransfer {
  id: string
  amountCents: number
  status: string
  sourceAccount: string
  destinationAccount: string
  confirmedAt?: string
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  accentColor = 'accent',
  subValue 
}: { 
  label: string
  value: string | number
  icon: React.ElementType
  accentColor?: 'accent' | 'success' | 'warning' | 'error'
  subValue?: string
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
          {subValue && (
            <p className="text-xs text-[var(--text-muted)] mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-[var(--radius-md)] ${bgColors[accentColor]}`}>
          <Icon className={`w-5 h-5 ${textColors[accentColor]}`} />
        </div>
      </div>
    </div>
  )
}

export function AccountantDashboard() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalReceived: 0,
    totalPending: 0,
    totalTransferred: 0,
    cashReceived: 0,
    stripeReceived: 0,
    achWireReceived: 0,
  })
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [recentTransfers, setRecentTransfers] = useState<RecentTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month') // week, month, quarter, year

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      const [paymentsRes, transfersRes] = await Promise.all([
        fetch(`/api/payments?limit=10`),
        fetch(`/api/treasury/transfers?limit=10`),
      ])

      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setRecentPayments(data.receipts || [])
        
        // Calculate summary from payments
        const receipts = data.receipts || []
        const received = receipts.filter((p: RecentPayment) => p.status === 'RECEIVED' || p.status === 'APPROVED')
        const pending = receipts.filter((p: RecentPayment) => p.status === 'PENDING' || p.status === 'PENDING_APPROVAL')
        
        setSummary(prev => ({
          ...prev,
          totalReceived: received.reduce((sum: number, p: RecentPayment) => sum + p.amountCents, 0),
          totalPending: pending.reduce((sum: number, p: RecentPayment) => sum + p.amountCents, 0),
          cashReceived: received.filter((p: RecentPayment) => p.method === 'CASH').reduce((sum: number, p: RecentPayment) => sum + p.amountCents, 0),
          stripeReceived: received.filter((p: RecentPayment) => p.method === 'STRIPE').reduce((sum: number, p: RecentPayment) => sum + p.amountCents, 0),
          achWireReceived: received.filter((p: RecentPayment) => p.method === 'ACH' || p.method === 'WIRE').reduce((sum: number, p: RecentPayment) => sum + p.amountCents, 0),
        }))
      }

      if (transfersRes.ok) {
        const data = await transfersRes.json()
        setRecentTransfers(data.transfers || [])
        
        const confirmed = (data.transfers || []).filter((t: RecentTransfer) => t.status === 'CONFIRMED')
        setSummary(prev => ({
          ...prev,
          totalTransferred: confirmed.reduce((sum: number, t: RecentTransfer) => sum + t.amountCents, 0),
        }))
      }
    } catch (error) {
      console.error('Failed to fetch financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const methodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return Wallet
      case 'STRIPE': return CreditCard
      case 'ACH':
      case 'WIRE': return Building
      default: return Receipt
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-sm">Loading financial data...</p>
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
            <Calculator className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Financial Dashboard</h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Overview of all payments, receipts, and treasury movements
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Received" 
          value={formatters.currency(summary.totalReceived / 100)} 
          icon={TrendingUp} 
          accentColor="success"
          subValue="All confirmed payments"
        />
        <StatCard 
          label="Pending" 
          value={formatters.currency(summary.totalPending / 100)} 
          icon={DollarSign} 
          accentColor="warning"
          subValue="Awaiting confirmation"
        />
        <StatCard 
          label="Transferred to Kraken" 
          value={formatters.currency(summary.totalTransferred / 100)} 
          icon={TrendingDown} 
          accentColor="accent"
          subValue="Confirmed transfers"
        />
        <StatCard 
          label="Net Position" 
          value={formatters.currency((summary.totalReceived - summary.totalTransferred) / 100)} 
          icon={PieChart} 
          accentColor="accent"
          subValue="Received - Transferred"
        />
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--success-muted)]">
              <Wallet className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Cash Received</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {formatters.currency(summary.cashReceived / 100)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--accent-muted)]">
              <CreditCard className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Stripe Payments</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {formatters.currency(summary.stripeReceived / 100)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--warning-muted)]">
              <Building className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">ACH/Wire</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {formatters.currency(summary.achWireReceived / 100)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">Recent Payments</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--text-muted)]">No payments recorded</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-default)]">
              {recentPayments.slice(0, 5).map(payment => {
                const Icon = methodIcon(payment.method)
                return (
                  <div key={payment.id} className="p-4 hover:bg-[var(--surface-overlay)] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--surface-overlay)]">
                          <Icon className="w-4 h-4 text-[var(--text-muted)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {payment.clientName || 'Unknown Client'}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {payment.method} • {formatters.timeago(payment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--text-primary)]">
                          {formatters.currency(payment.amountCents / 100)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          payment.status === 'RECEIVED' || payment.status === 'APPROVED'
                            ? 'bg-[var(--success-muted)] text-[var(--success)]'
                            : 'bg-[var(--warning-muted)] text-[var(--warning)]'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Transfers */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">Treasury Transfers</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          {recentTransfers.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart3 className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--text-muted)]">No transfers recorded</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-default)]">
              {recentTransfers.slice(0, 5).map(transfer => (
                <div key={transfer.id} className="p-4 hover:bg-[var(--surface-overlay)] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {transfer.sourceAccount} → {transfer.destinationAccount}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {transfer.confirmedAt ? formatters.datetime(transfer.confirmedAt) : 'Pending'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {formatters.currency(transfer.amountCents / 100)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        transfer.status === 'CONFIRMED'
                          ? 'bg-[var(--success-muted)] text-[var(--success)]'
                          : transfer.status === 'SUBMITTED'
                          ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                          : 'bg-[var(--warning-muted)] text-[var(--warning)]'
                      }`}>
                        {transfer.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reports Section */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Payment Summary Report
          </Button>
          <Button variant="outline" className="justify-start">
            <BarChart3 className="w-4 h-4 mr-2" />
            Treasury Movement Report
          </Button>
          <Button variant="outline" className="justify-start">
            <PieChart className="w-4 h-4 mr-2" />
            Cash Flow Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}
