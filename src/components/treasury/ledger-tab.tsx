import { DollarSign, ArrowDownLeft, ArrowUpRight, Building2, Plus, Clock } from 'lucide-react'
import { formatters } from '@/lib/formatters'
import type { LedgerSummary } from '@/types/treasury'

interface LedgerTabProps {
  ledger: LedgerSummary
}

export function LedgerTab({ ledger }: LedgerTabProps) {
  return (
    <div className="space-y-6">
      {/* Accounts Table */}
      <div className="rounded-lg border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-sunken)]">
            <tr>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Account</th>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Institution</th>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Type</th>
              <th className="px-4 py-3 text-right text-[var(--text-muted)] font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {ledger.accounts.map((account) => (
              <tr key={account.id} className="hover:bg-[var(--surface-raised)]">
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                  {account.name}
                  {account.accountNumberLast4 && (
                    <span className="text-[var(--text-muted)] ml-2">****{account.accountNumberLast4}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{account.institution}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    account.type === 'checking' ? 'bg-blue-500/20 text-blue-400' :
                    account.type === 'cash' ? 'bg-green-500/20 text-green-400' :
                    account.type === 'crypto' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {account.type}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-mono font-semibold ${
                  account.balance < 0 ? 'text-red-400' : 'text-[var(--text-primary)]'
                }`}>
                  {formatters.currency(account.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Recent Transactions</h3>
        {ledger.recentTransactions.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-8">No transactions yet. Use Quick Actions above to get started.</p>
        ) : (
          <div className="space-y-2">
            {ledger.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.metadata?.type === 'CASH_INCOME' ? 'bg-green-500/20' :
                    tx.metadata?.type === 'OWNER_DRAW' ? 'bg-orange-500/20' :
                    tx.metadata?.type === 'CASH_DEPOSIT' ? 'bg-blue-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    {tx.metadata?.type === 'CASH_INCOME' && <ArrowDownLeft className="w-4 h-4 text-green-400" />}
                    {tx.metadata?.type === 'OWNER_DRAW' && <ArrowUpRight className="w-4 h-4 text-orange-400" />}
                    {tx.metadata?.type === 'CASH_DEPOSIT' && <Building2 className="w-4 h-4 text-blue-400" />}
                    {tx.metadata?.type === 'CAPITAL_CONTRIBUTION' && <Plus className="w-4 h-4 text-green-400" />}
                    {!tx.metadata?.type && <DollarSign className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{tx.description}</p>
                    <p className="text-xs text-[var(--text-muted)]">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <p className={`font-mono font-semibold ${
                  tx.metadata?.type === 'OWNER_DRAW' ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {tx.metadata?.type === 'OWNER_DRAW' ? '-' : '+'}
                  {formatters.currency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Transfers */}
      {ledger.pendingTransfers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Pending Transfers</h3>
          <div className="space-y-2">
            {ledger.pendingTransfers.map((xfer) => (
              <div key={xfer.id} className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{xfer.from} → {xfer.to}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {xfer.method.toUpperCase()} • Est. arrival: {xfer.estimatedArrival ? new Date(xfer.estimatedArrival).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <p className="font-mono font-semibold text-yellow-400">{formatters.currency(xfer.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
