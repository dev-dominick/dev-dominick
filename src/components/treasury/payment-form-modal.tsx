import { Button, Input, Textarea } from '@/components/ui'
import type { PaymentFormData } from '@/types/treasury'

interface PaymentFormModalProps {
    show: boolean
    form: PaymentFormData
    submitting: boolean
    error: string | null
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    onChange: (form: PaymentFormData) => void
}

export function PaymentFormModal({
    show,
    form,
    submitting,
    error,
    onClose,
    onSubmit,
    onChange,
}: PaymentFormModalProps) {
    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--surface-raised)] rounded-lg p-6 w-full max-w-md border border-[var(--border-default)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Record Cash/Manual Payment</h2>
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="payment-amount" className="block text-sm text-[var(--text-secondary)] mb-1">Amount (USD) *</label>
                        <Input
                            id="payment-amount"
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
                        <label htmlFor="payment-method" className="block text-sm text-[var(--text-secondary)] mb-1">Method *</label>
                        <select
                            id="payment-method"
                            value={form.method}
                            onChange={(e) => onChange({ ...form, method: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                            <option value="CASH">💵 Cash</option>
                            <option value="ACH">🏦 ACH Transfer</option>
                            <option value="WIRE">⚡ Wire Transfer</option>
                            <option value="CHECK">📝 Check</option>
                            <option value="OTHER">📋 Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="payment-client-name" className="block text-sm text-[var(--text-secondary)] mb-1">Client Name</label>
                        <Input
                            id="payment-client-name"
                            value={form.clientName}
                            onChange={(e) => onChange({ ...form, clientName: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label htmlFor="payment-client-email" className="block text-sm text-[var(--text-secondary)] mb-1">Client Email</label>
                        <Input
                            id="payment-client-email"
                            type="email"
                            value={form.clientEmail}
                            onChange={(e) => onChange({ ...form, clientEmail: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="payment-ref" className="block text-sm text-[var(--text-secondary)] mb-1">Reference # (check number, bank ref, etc.)</label>
                        <Input
                            id="payment-ref"
                            value={form.externalRef}
                            onChange={(e) => onChange({ ...form, externalRef: e.target.value })}
                            placeholder="CHK-12345"
                        />
                    </div>
                    <div>
                        <label htmlFor="payment-notes" className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label>
                        <Textarea
                            id="payment-notes"
                            value={form.notes}
                            onChange={(e) => onChange({ ...form, notes: e.target.value })}
                            placeholder="Payment details, context..."
                            textareaSize="sm"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Recording...' : 'Record Payment'}
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
