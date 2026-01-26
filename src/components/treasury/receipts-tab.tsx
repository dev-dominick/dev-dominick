import { DollarSign } from 'lucide-react'
import { formatters } from '@/lib/formatters'
import { METHOD_COLORS, STATUS_ICONS } from '@/lib/treasury-constants'
import type { PaymentReceipt } from '@/types/treasury'

interface ReceiptsTabProps {
  receipts: PaymentReceipt[]
}

export function ReceiptsTab({ receipts }: ReceiptsTabProps) {
  if (receipts.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)]">
        <DollarSign className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
        <p className="text-[var(--text-secondary)]">No payment receipts yet</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">Record cash payments or they&apos;ll appear automatically from Stripe</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {receipts.map((r) => (
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
      ))}
    </div>
  )
}
