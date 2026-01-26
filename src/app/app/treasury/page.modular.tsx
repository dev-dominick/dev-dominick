'use client'

import { DollarSign, ArrowDownLeft, ArrowUpRight, Plus, Building2, Banknote, Wallet, TrendingUp, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { formatters } from '@/lib/formatters'
import { useTreasury } from '@/hooks/use-treasury'
import {
  LedgerTab,
  TaxesTab,
  ReceiptsTab,
  TransfersTab,
  PaymentFormModal,
  TransferFormModal,
} from '@/components/treasury'

export default function TreasuryPage() {
  const treasury = useTreasury()

  if (treasury.loading) {
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Treasury</h1>
          <p className="text-[var(--text-secondary)]">Your financial life source — track cash, transfers, and investments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={treasury.fetchLedger} size="sm" variant="ghost">
            <RefreshCw className={`w-4 h-4 ${treasury.ledgerLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild size="sm" variant="secondary">
            <a href="/app/banks">
              <Building2 className="w-4 h-4 mr-1" /> Connect Banks
            </a>
          </Button>
          <Button onClick={treasury.openPaymentForm} size="sm" variant="ghost">
            <Plus className="w-4 h-4 mr-1" /> DB Payment
          </Button>
        </div>
      </div>

      {/* Cash Position Cards */}
      {treasury.ledger && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <CashCard icon={<Building2 className="w-4 h-4 text-blue-400" />} label="Fulton Bank" value={treasury.ledger.cashPosition.bankBalance} negative />
          <CashCard icon={<Banknote className="w-4 h-4 text-green-400" />} label="Cash on Hand" value={treasury.ledger.cashPosition.cashOnHand} color="text-green-400" />
          <CashCard icon={<TrendingUp className="w-4 h-4 text-purple-400" />} label="Kraken" value={treasury.ledger.cashPosition.krakenBalance} color="text-purple-400" />
          <CashCard icon={<Wallet className="w-4 h-4 text-[var(--accent)]" />} label="Total Liquid" value={treasury.ledger.cashPosition.totalLiquid} negative color="text-[var(--accent)]" />
          <CashCard icon={<DollarSign className="w-4 h-4 text-green-400" />} label="Revenue" value={treasury.ledger.totals.revenue} color="text-green-400" />
          <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-orange-400" />
              <p className="text-xs text-[var(--text-muted)]">Owner Equity</p>
            </div>
            <p className={`text-xl font-bold font-mono ${treasury.ledger.totals.ownerEquity < 0 ? 'text-orange-400' : 'text-[var(--text-primary)]'}`}>
              {formatters.currency(Math.abs(treasury.ledger.totals.ownerEquity))}
              <span className="text-xs ml-1">{treasury.ledger.totals.ownerEquity < 0 ? '(owed to you)' : ''}</span>
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => treasury.startLedgerAction('cash_income')} className="bg-green-600 hover:bg-green-700">
            <ArrowDownLeft className="w-4 h-4 mr-1" /> Log Cash Income
          </Button>
          <Button size="sm" onClick={() => treasury.startLedgerAction('expense')} className="bg-red-600 hover:bg-red-700">
            <CreditCard className="w-4 h-4 mr-1" /> Log Expense
          </Button>
          <Button size="sm" variant="secondary" onClick={() => treasury.startLedgerAction('deposit_to_bank')}>
            <Building2 className="w-4 h-4 mr-1" /> Deposit to Bank
          </Button>
          <Button size="sm" variant="secondary" onClick={() => treasury.startLedgerAction('owner_draw')}>
            <ArrowUpRight className="w-4 h-4 mr-1" /> Owner Draw
          </Button>
          <Button size="sm" variant="secondary" onClick={() => treasury.startLedgerAction('ach_to_kraken')}>
            <TrendingUp className="w-4 h-4 mr-1" /> Fund Kraken
          </Button>
          <Button size="sm" variant="ghost" onClick={() => treasury.startLedgerAction('capital_contribution')}>
            <Plus className="w-4 h-4 mr-1" /> Capital In
          </Button>
        </div>
      </div>

      {/* Ledger Action Form */}
      {treasury.ledgerAction && (
        <LedgerActionForm treasury={treasury} />
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-default)]">
        <TabButton active={treasury.tab === 'ledger'} onClick={() => treasury.setTab('ledger')} icon={<Wallet className="w-4 h-4" />} label="Internal Ledger" />
        <TabButton active={treasury.tab === 'taxes'} onClick={() => treasury.setTab('taxes')} icon={<AlertTriangle className="w-4 h-4" />} label="Taxes & P/L" />
        <TabButton active={treasury.tab === 'receipts'} onClick={() => treasury.setTab('receipts')} icon={<Banknote className="w-4 h-4" />} label={`DB Receipts (${treasury.receipts.length})`} />
        <TabButton active={treasury.tab === 'transfers'} onClick={() => treasury.setTab('transfers')} icon={<Building2 className="w-4 h-4" />} label={`DB Transfers (${treasury.transfers.length})`} />
      </div>

      {/* Tab Content */}
      {treasury.tab === 'ledger' && treasury.ledger && <LedgerTab ledger={treasury.ledger} />}
      {treasury.tab === 'taxes' && treasury.ledger && <TaxesTab ledger={treasury.ledger} />}
      {treasury.tab === 'receipts' && <ReceiptsTab receipts={treasury.receipts} />}
      {treasury.tab === 'transfers' && <TransfersTab transfers={treasury.transfers} onUpdateStatus={treasury.handleUpdateTransferStatus} />}

      {/* Modals */}
      <PaymentFormModal
        show={treasury.showPaymentForm}
        form={treasury.paymentForm}
        submitting={treasury.submitting}
        error={treasury.error}
        onClose={treasury.closePaymentForm}
        onSubmit={treasury.handleCreatePayment}
        onChange={treasury.setPaymentForm}
      />
      <TransferFormModal
        show={treasury.showTransferForm}
        form={treasury.transferForm}
        submitting={treasury.submitting}
        error={treasury.error}
        receipts={treasury.receipts}
        onClose={treasury.closeTransferForm}
        onSubmit={treasury.handleCreateTransfer}
        onChange={treasury.setTransferForm}
      />
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

function CashCard({ icon, label, value, color, negative }: { icon: React.ReactNode; label: string; value: number; color?: string; negative?: boolean }) {
  const displayColor = negative && value < 0 ? 'text-red-400' : color || 'text-[var(--text-primary)]'
  return (
    <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
      </div>
      <p className={`text-xl font-bold font-mono ${displayColor}`}>{formatters.currency(value)}</p>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-[var(--accent)] text-[var(--accent)]'
          : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      <span className="inline mr-2">{icon}</span>
      {label}
    </button>
  )
}

function LedgerActionForm({ treasury }: { treasury: ReturnType<typeof useTreasury> }) {
  const actionLabels: Record<string, string> = {
    cash_income: '💵 Log Cash Income',
    expense: '🧾 Log Business Expense',
    owner_draw: '📤 Owner Draw',
    deposit_to_bank: '🏦 Deposit Cash to Fulton',
    ach_to_kraken: '📈 ACH to Kraken',
    capital_contribution: '💰 Capital Contribution',
  }

  const descriptions: Record<string, string> = {
    cash_income: 'Records cash received as business income.',
    owner_draw: 'Withdraws cash from business to yourself. This decreases cash on hand.',
    deposit_to_bank: 'Moves cash on hand to your Fulton Bank account.',
    ach_to_kraken: 'Records an ACH transfer from Fulton to Kraken (pending until confirmed).',
    capital_contribution: 'Adds personal funds to the business.',
  }

  return (
    <div className="p-4 rounded-lg border-2 border-[var(--accent)] bg-[var(--surface-raised)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--text-primary)]">{actionLabels[treasury.ledgerAction!]}</h3>
        <button onClick={treasury.clearLedgerAction} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
      </div>
      {treasury.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{treasury.error}</div>
      )}

      {treasury.ledgerAction === 'expense' && treasury.ledger?.expenseCategories ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          <Input type="number" step="0.01" min="0.01" placeholder="Amount ($)" value={treasury.ledgerAmount} onChange={(e) => treasury.setLedgerAmount(e.target.value)} />
          <select
            value={treasury.expenseCategory}
            onChange={(e) => treasury.setExpenseCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-sunken)] text-[var(--text-primary)]"
            aria-label="Expense Category"
          >
            <option value="">Select category...</option>
            {treasury.ledger.expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <Input placeholder="Vendor (optional)" value={treasury.expenseVendor} onChange={(e) => treasury.setExpenseVendor(e.target.value)} />
          <select
            value={treasury.expensePaidFrom}
            onChange={(e) => treasury.setExpensePaidFrom(e.target.value as 'cash' | 'bank')}
            className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-sunken)] text-[var(--text-primary)]"
            aria-label="Paid From"
          >
            <option value="cash">Paid from Cash</option>
            <option value="bank">Paid from Bank</option>
          </select>
          <Button onClick={() => treasury.handleLedgerAction('expense')} disabled={treasury.ledgerSubmitting || !treasury.ledgerAmount || !treasury.expenseCategory}>
            {treasury.ledgerSubmitting ? 'Saving...' : 'Log Expense'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input type="number" step="0.01" min="1" placeholder="Amount ($)" value={treasury.ledgerAmount} onChange={(e) => treasury.setLedgerAmount(e.target.value)} className="md:col-span-1" />
          {treasury.ledgerAction === 'cash_income' && (
            <Input placeholder="Client name (optional)" value={treasury.ledgerClient} onChange={(e) => treasury.setLedgerClient(e.target.value)} className="md:col-span-1" />
          )}
          <Input placeholder="Note (optional)" value={treasury.ledgerNote} onChange={(e) => treasury.setLedgerNote(e.target.value)} className={treasury.ledgerAction === 'cash_income' ? 'md:col-span-1' : 'md:col-span-2'} />
          <Button onClick={() => treasury.handleLedgerAction(treasury.ledgerAction!)} disabled={treasury.ledgerSubmitting || !treasury.ledgerAmount} className="md:col-span-1">
            {treasury.ledgerSubmitting ? 'Processing...' : 'Submit'}
          </Button>
        </div>
      )}

      {treasury.ledgerAction === 'expense' && treasury.expenseCategory && treasury.ledger?.expenseCategories && (
        <p className="text-xs text-[var(--text-muted)] mt-2">
          📋 Schedule C Line {treasury.ledger.expenseCategories.find(c => c.id === treasury.expenseCategory)?.scheduleC}: {treasury.ledger.expenseCategories.find(c => c.id === treasury.expenseCategory)?.description}
        </p>
      )}
      {treasury.ledgerAction !== 'expense' && descriptions[treasury.ledgerAction!] && (
        <p className="text-xs text-[var(--text-muted)] mt-2">{descriptions[treasury.ledgerAction!]}</p>
      )}
    </div>
  )
}
