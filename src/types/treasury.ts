// ============================================================================
// Treasury Types
// ============================================================================

export interface LedgerAccount {
  id: string
  name: string
  type: string
  institution: string
  balance: number
  balanceCents: number
  isExternal: boolean
  routingNumber?: string
  accountNumberLast4?: string
}

export interface LedgerTransaction {
  id: string
  timestamp: string
  description: string
  amount: number
  status: string
  metadata?: Record<string, unknown>
}

export interface LedgerTransfer {
  id: string
  from: string
  to: string
  amount: number
  method: string
  status: string
  createdAt: string
  estimatedArrival?: string
}

export interface CashPosition {
  bankBalance: number
  cashOnHand: number
  krakenBalance: number
  totalLiquid: number
  totalAll: number
  pendingIn: number
  pendingOut: number
}

export interface TaxEstimate {
  grossIncome: number
  totalDeductions: number
  netIncome: number
  selfEmploymentTax: number
  estimatedIncomeTax: number
  estimatedTotalTax: number
  estimatedQuarterlyPayment: number
  effectiveRate: number
}

export interface ExpenseCategory {
  id: string
  name: string
  scheduleC: number
  description: string
}

export interface ExpenseBreakdown {
  id: string
  name: string
  scheduleC?: number
  total: number
  itemCount: number
}

export interface LedgerSummary {
  accounts: LedgerAccount[]
  cashPosition: CashPosition
  recentTransactions: LedgerTransaction[]
  pendingTransfers: LedgerTransfer[]
  totals: {
    revenue: number
    expenses: number
    netIncome: number
    ownerEquity: number
  }
  taxEstimate: TaxEstimate
  expensesByCategory: ExpenseBreakdown[]
  expenseCategories: ExpenseCategory[]
}

// ============================================================================
// Legacy Types (for DB-backed features)
// ============================================================================

export interface PaymentReceipt {
  id: string
  method: string
  amountUsd: number
  status: string
  receivedAt: string | null
  clientName: string | null
  clientEmail: string | null
  description: string | null
  notes: string | null
  externalRef: string | null
  createdAt: string
  treasuryTransfers: Array<{
    id: string
    status: string
    amountCents: number
    destinationAccount: string
  }>
}

export interface TreasuryTransfer {
  id: string
  sourceAccount: string
  destinationAccount: string
  method: string
  amountUsd: number
  status: string
  plannedAt: string
  submittedAt: string | null
  confirmedAt: string | null
  bankRef: string | null
  krakenRef: string | null
  notes: string | null
  paymentReceipt: {
    id: string
    method: string
    amountCents: number
    clientName: string | null
  } | null
}

export interface Summary {
  totalReceived: number
  totalPending: number
  byMethod: Record<string, { count: number; amountUsd: number }>
}

export interface TransferSummary {
  planned: number
  submitted: number
  confirmed: number
}

// ============================================================================
// Form Types
// ============================================================================

export interface PaymentFormData {
  amountUsd: string
  method: string
  clientName: string
  clientEmail: string
  notes: string
  externalRef: string
}

export interface TransferFormData {
  amountUsd: string
  sourceAccount: string
  method: string
  notes: string
  paymentReceiptId: string
}

export type TreasuryTab = 'ledger' | 'taxes' | 'receipts' | 'transfers'
export type LedgerActionType = 'cash_income' | 'expense' | 'owner_draw' | 'deposit_to_bank' | 'ach_to_kraken' | 'capital_contribution'
export type ExpensePaidFrom = 'cash' | 'bank'
