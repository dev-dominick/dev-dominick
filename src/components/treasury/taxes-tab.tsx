import { CreditCard } from 'lucide-react'
import { formatters } from '@/lib/formatters'
import type { LedgerSummary } from '@/types/treasury'

interface TaxesTabProps {
  ledger: LedgerSummary
}

export function TaxesTab({ ledger }: TaxesTabProps) {
  return (
    <div className="space-y-6">
      {/* P&L Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg border border-green-500/30 bg-green-500/5">
          <p className="text-sm text-[var(--text-muted)] mb-1">Gross Revenue</p>
          <p className="text-3xl font-bold font-mono text-green-400">{formatters.currency(ledger.taxEstimate.grossIncome)}</p>
        </div>
        <div className="p-5 rounded-lg border border-red-500/30 bg-red-500/5">
          <p className="text-sm text-[var(--text-muted)] mb-1">Total Deductions</p>
          <p className="text-3xl font-bold font-mono text-red-400">-{formatters.currency(ledger.taxEstimate.totalDeductions)}</p>
        </div>
        <div className="p-5 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5">
          <p className="text-sm text-[var(--text-muted)] mb-1">Net Income</p>
          <p className={`text-3xl font-bold font-mono ${ledger.taxEstimate.netIncome >= 0 ? 'text-[var(--accent)]' : 'text-red-400'}`}>
            {formatters.currency(ledger.taxEstimate.netIncome)}
          </p>
        </div>
      </div>

      {/* Tax Estimate */}
      <div className="p-5 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">📊 Estimated Tax Liability (Self-Employed)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Self-Employment Tax (15.3%)</p>
            <p className="text-xl font-bold font-mono text-yellow-400">{formatters.currency(ledger.taxEstimate.selfEmploymentTax)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Est. Income Tax (~22%)</p>
            <p className="text-xl font-bold font-mono text-yellow-400">{formatters.currency(ledger.taxEstimate.estimatedIncomeTax)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Total Tax Estimate</p>
            <p className="text-xl font-bold font-mono text-red-400">{formatters.currency(ledger.taxEstimate.estimatedTotalTax)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Quarterly Payment</p>
            <p className="text-xl font-bold font-mono text-orange-400">{formatters.currency(ledger.taxEstimate.estimatedQuarterlyPayment)}</p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          💡 Effective rate: {ledger.taxEstimate.effectiveRate.toFixed(1)}% • Set aside ~30% of revenue for taxes • Due dates: Apr 15, Jun 15, Sep 15, Jan 15
        </p>
      </div>

      {/* Expenses by Category */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">📋 Expenses by Category (Schedule C)</h3>
        {ledger.expensesByCategory.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[var(--border-default)] rounded-lg">
            <CreditCard className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2" />
            <p className="text-[var(--text-muted)]">No expenses logged yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Click &quot;Log Expense&quot; above to start tracking deductions</p>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border-default)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-sunken)]">
                <tr>
                  <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Schedule C Line</th>
                  <th className="px-4 py-3 text-right text-[var(--text-muted)] font-medium"># Items</th>
                  <th className="px-4 py-3 text-right text-[var(--text-muted)] font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {ledger.expensesByCategory.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[var(--surface-raised)]">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{cat.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">Line {cat.scheduleC}</td>
                    <td className="px-4 py-3 text-right text-[var(--text-secondary)]">{cat.itemCount}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-red-400">
                      {formatters.currency(cat.total)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[var(--surface-sunken)] font-semibold">
                  <td className="px-4 py-3 text-[var(--text-primary)]" colSpan={3}>Total Deductions</td>
                  <td className="px-4 py-3 text-right font-mono text-red-400">
                    {formatters.currency(ledger.taxEstimate.totalDeductions)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* After-Tax Income */}
      <div className="p-5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">💰 What You Actually Keep</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Net Income</p>
            <p className="text-xl font-mono">{formatters.currency(ledger.taxEstimate.netIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Est. Taxes</p>
            <p className="text-xl font-mono text-red-400">-{formatters.currency(ledger.taxEstimate.estimatedTotalTax)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Take-Home</p>
            <p className="text-xl font-mono font-bold text-green-400">
              {formatters.currency(ledger.taxEstimate.netIncome - ledger.taxEstimate.estimatedTotalTax)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
