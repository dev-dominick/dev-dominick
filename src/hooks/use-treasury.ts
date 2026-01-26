'use client'

import { useEffect, useState, useCallback } from 'react'
import type {
  LedgerSummary,
  PaymentReceipt,
  TreasuryTransfer,
  Summary,
  TransferSummary,
  PaymentFormData,
  TransferFormData,
  TreasuryTab,
  LedgerActionType,
  ExpensePaidFrom,
} from '@/types/treasury'
import { INITIAL_PAYMENT_FORM, INITIAL_TRANSFER_FORM } from '@/lib/treasury-constants'

export function useTreasury() {
  // Internal Ledger State
  const [ledger, setLedger] = useState<LedgerSummary | null>(null)
  const [ledgerLoading, setLedgerLoading] = useState(true)

  // Legacy state (DB-backed when online)
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([])
  const [transfers, setTransfers] = useState<TreasuryTransfer[]>([])
  const [summary, setSummary] = useState<Summary>({ totalReceived: 0, totalPending: 0, byMethod: {} })
  const [transferSummary, setTransferSummary] = useState<TransferSummary>({ planned: 0, submitted: 0, confirmed: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TreasuryTab>('ledger')

  // Ledger action form
  const [ledgerAction, setLedgerAction] = useState<LedgerActionType | null>(null)
  const [ledgerAmount, setLedgerAmount] = useState('')
  const [ledgerClient, setLedgerClient] = useState('')
  const [ledgerNote, setLedgerNote] = useState('')
  const [ledgerSubmitting, setLedgerSubmitting] = useState(false)
  const [expenseCategory, setExpenseCategory] = useState('')
  const [expenseVendor, setExpenseVendor] = useState('')
  const [expensePaidFrom, setExpensePaidFrom] = useState<ExpensePaidFrom>('cash')

  // Forms
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>(INITIAL_PAYMENT_FORM)
  const [transferForm, setTransferForm] = useState<TransferFormData>(INITIAL_TRANSFER_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch internal ledger
  const fetchLedger = useCallback(async () => {
    try {
      setLedgerLoading(true)
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setLedger(data)
      }
    } catch (err) {
      console.error('Error fetching ledger:', err)
    } finally {
      setLedgerLoading(false)
    }
  }, [])

  // Fetch DB-backed data
  const fetchData = useCallback(async () => {
    try {
      const [receiptsRes, transfersRes] = await Promise.all([
        fetch('/api/payments?limit=100'),
        fetch('/api/treasury/transfers?limit=100'),
      ])

      if (receiptsRes.ok) {
        const receiptsData = await receiptsRes.json()
        setReceipts(receiptsData.receipts || [])
        setSummary(receiptsData.summary || { totalReceived: 0, totalPending: 0, byMethod: {} })
      }

      if (transfersRes.ok) {
        const transfersData = await transfersRes.json()
        setTransfers(transfersData.transfers || [])
        setTransferSummary(transfersData.summary || { planned: 0, submitted: 0, confirmed: 0 })
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLedger()
    fetchData()
  }, [fetchLedger, fetchData])

  // Handle ledger actions
  const handleLedgerAction = useCallback(async (action: string) => {
    if (!ledgerAmount || parseFloat(ledgerAmount) <= 0) {
      setError('Enter a valid amount')
      return
    }

    // For expenses, category is required
    if (action === 'expense' && !expenseCategory) {
      setError('Select an expense category')
      return
    }

    setLedgerSubmitting(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        action,
        amountUsd: parseFloat(ledgerAmount),
        clientName: ledgerClient || undefined,
        note: ledgerNote || undefined,
      }

      // Add expense-specific fields
      if (action === 'expense') {
        body.category = expenseCategory
        body.vendor = expenseVendor || undefined
        body.paidFrom = expensePaidFrom
      }

      const res = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.data?.summary) {
          setLedger(data.data.summary)
        } else {
          fetchLedger()
        }
        setLedgerAction(null)
        setLedgerAmount('')
        setLedgerClient('')
        setLedgerNote('')
        setExpenseCategory('')
        setExpenseVendor('')
        setExpensePaidFrom('cash')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to process')
      }
    } catch {
      setError('Network error')
    } finally {
      setLedgerSubmitting(false)
    }
  }, [ledgerAmount, ledgerClient, ledgerNote, expenseCategory, expenseVendor, expensePaidFrom, fetchLedger])

  // Handle payment creation
  const handleCreatePayment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: parseFloat(paymentForm.amountUsd),
          method: paymentForm.method,
          clientName: paymentForm.clientName || undefined,
          clientEmail: paymentForm.clientEmail || undefined,
          notes: paymentForm.notes || undefined,
          externalRef: paymentForm.externalRef || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create payment')
        return
      }

      setShowPaymentForm(false)
      setPaymentForm(INITIAL_PAYMENT_FORM)
      fetchData()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [paymentForm, fetchData])

  // Handle transfer creation
  const handleCreateTransfer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/treasury/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: parseFloat(transferForm.amountUsd),
          sourceAccount: transferForm.sourceAccount,
          method: transferForm.method,
          notes: transferForm.notes || undefined,
          paymentReceiptId: transferForm.paymentReceiptId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create transfer')
        return
      }

      setShowTransferForm(false)
      setTransferForm(INITIAL_TRANSFER_FORM)
      fetchData()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [transferForm, fetchData])

  // Handle transfer status update
  const handleUpdateTransferStatus = useCallback(async (
    id: string,
    status: string,
    refs?: { bankRef?: string; krakenRef?: string }
  ) => {
    try {
      const res = await fetch(`/api/treasury/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...refs }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Error updating transfer:', err)
    }
  }, [fetchData])

  // Start ledger action
  const startLedgerAction = useCallback((action: LedgerActionType) => {
    setLedgerAction(action)
    setError(null)
  }, [])

  // Clear ledger action
  const clearLedgerAction = useCallback(() => {
    setLedgerAction(null)
  }, [])

  // Open payment form
  const openPaymentForm = useCallback(() => {
    setShowPaymentForm(true)
    setError(null)
  }, [])

  // Close payment form
  const closePaymentForm = useCallback(() => {
    setShowPaymentForm(false)
  }, [])

  // Open transfer form
  const openTransferForm = useCallback(() => {
    setShowTransferForm(true)
    setError(null)
  }, [])

  // Close transfer form
  const closeTransferForm = useCallback(() => {
    setShowTransferForm(false)
  }, [])

  return {
    // State
    ledger,
    ledgerLoading,
    receipts,
    transfers,
    summary,
    transferSummary,
    loading,
    tab,
    ledgerAction,
    ledgerAmount,
    ledgerClient,
    ledgerNote,
    ledgerSubmitting,
    expenseCategory,
    expenseVendor,
    expensePaidFrom,
    showPaymentForm,
    showTransferForm,
    paymentForm,
    transferForm,
    submitting,
    error,

    // Setters
    setTab,
    setLedgerAmount,
    setLedgerClient,
    setLedgerNote,
    setExpenseCategory,
    setExpenseVendor,
    setExpensePaidFrom,
    setPaymentForm,
    setTransferForm,
    setError,

    // Actions
    fetchLedger,
    fetchData,
    handleLedgerAction,
    handleCreatePayment,
    handleCreateTransfer,
    handleUpdateTransferStatus,
    startLedgerAction,
    clearLedgerAction,
    openPaymentForm,
    closePaymentForm,
    openTransferForm,
    closeTransferForm,
  }
}
