import { Button, Input, Textarea } from '@/components/ui'
import { formatters } from '@/lib/formatters'
import type { TransferFormData, PaymentReceipt } from '@/types/treasury'

interface TransferFormModalProps {
    show: boolean
    form: TransferFormData
    submitting: boolean
    error: string | null
    receipts: PaymentReceipt[]
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    onChange: (form: TransferFormData) => void
}

export function TransferFormModal({
    show,
    form,
    submitting,
    error,
    receipts,
    onClose,
    onSubmit,
    onChange,
}: TransferFormModalProps) {
    if (!show) return null

    return (
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
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="transfer-amount" className="block text-sm text-[var(--text-secondary)] mb-1">Amount (USD) *</label>
                        <Input
                            id="transfer-amount"
                            type="number"
                            step="0.01"
                            min="1"
                            value={form.amountUsd}
                            onChange={(e) => onChange({ ...form, amountUsd: e.target.value })}
                            placeholder="10000.00"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="transfer-source" className="block text-sm text-[var(--text-secondary)] mb-1">Source Account *</label>
                        <select
                            id="transfer-source"
                            value={form.sourceAccount}
                            onChange={(e) => onChange({ ...form, sourceAccount: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                            <option value="FULTON_BANK">🏦 Fulton Bank</option>
                            <option value="CASH_ON_HAND">💵 Cash on Hand</option>
                            <option value="STRIPE_BALANCE">💳 Stripe Balance</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="transfer-method" className="block text-sm text-[var(--text-secondary)] mb-1">Transfer Method *</label>
                        <select
                            id="transfer-method"
                            value={form.method}
                            onChange={(e) => onChange({ ...form, method: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                            <option value="ACH">ACH (2-3 days)</option>
                            <option value="WIRE">Wire (same day)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="transfer-receipt" className="block text-sm text-[var(--text-secondary)] mb-1">Link to Payment Receipt (optional)</label>
                        <select
                            id="transfer-receipt"
                            value={form.paymentReceiptId}
                            onChange={(e) => onChange({ ...form, paymentReceiptId: e.target.value })}
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
                        <label htmlFor="transfer-notes" className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label>
                        <Textarea
                            id="transfer-notes"
                            value={form.notes}
                            onChange={(e) => onChange({ ...form, notes: e.target.value })}
                            placeholder="Transfer purpose, context..."
                            textareaSize="sm"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Plan Transfer'}
                        </Button>
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
