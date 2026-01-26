import { Building2, ArrowRight, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatters } from '@/lib/formatters'
import { STATUS_ICONS } from '@/lib/treasury-constants'
import type { TreasuryTransfer } from '@/types/treasury'

interface TransfersTabProps {
  transfers: TreasuryTransfer[]
  onUpdateStatus: (id: string, status: string, refs?: { bankRef?: string; krakenRef?: string }) => void
}

export function TransfersTab({ transfers, onUpdateStatus }: TransfersTabProps) {
  if (transfers.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
        <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
        <p className="text-[var(--text-secondary)]">No Kraken transfers yet</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">Plan a transfer to move funds from Fulton Bank to Kraken</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transfers.map((t) => (
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
                  onClick={() => onUpdateStatus(t.id, 'SUBMITTED')}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Mark Submitted
                </Button>
              )}
              {t.status === 'SUBMITTED' && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onUpdateStatus(t.id, 'CONFIRMED')}
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
                  onClick={() => onUpdateStatus(t.id, 'CANCELED')}
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
      ))}
    </div>
  )
}
