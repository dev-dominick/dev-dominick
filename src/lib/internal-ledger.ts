/**
 * Internal Ledger System
 * YOUR banking infrastructure. No external APIs.
 * Double-entry bookkeeping with internal accounts.
 */

// ============================================================================
// Account Definitions
// ============================================================================

export interface BankAccount {
  id: string
  name: string
  type: 'checking' | 'savings' | 'cash' | 'crypto' | 'external'
  routingNumber?: string
  accountNumber?: string
  institution: string
  balanceCents: number
  currency: string
  isExternal: boolean
  createdAt: string
  updatedAt: string
}

export interface LedgerEntry {
  id: string
  timestamp: string
  description: string
  entries: {
    accountId: string
    type: 'debit' | 'credit'
    amountCents: number
  }[]
  metadata?: Record<string, unknown>
  status: 'pending' | 'posted' | 'failed' | 'reversed'
  reference?: string
}

export interface Transfer {
  id: string
  fromAccountId: string
  toAccountId: string
  amountCents: number
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: 'internal' | 'ach' | 'wire' | 'cash_deposit' | 'cash_withdrawal'
  reference?: string
  createdAt: string
  completedAt?: string
  estimatedArrival?: string
}

// ============================================================================
// Your Accounts - Fulton Bank (Real routing, sandbox account)
// ============================================================================

const FULTON_ROUTING = '031301422'  // Real Fulton routing number
const FULTON_ACCOUNT = '4758392016' // Sandbox account number

export const INTERNAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acct_fulton_checking',
    name: 'Fulton Business Checking',
    type: 'checking',
    routingNumber: FULTON_ROUTING,
    accountNumber: FULTON_ACCOUNT,
    institution: 'Fulton Bank',
    balanceCents: -5000, // -$50.00 overdraft (your current situation)
    currency: 'USD',
    isExternal: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acct_cash_on_hand',
    name: 'Cash on Hand',
    type: 'cash',
    institution: 'Physical Cash',
    balanceCents: 0,
    currency: 'USD',
    isExternal: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acct_kraken',
    name: 'Kraken Trading',
    type: 'crypto',
    institution: 'Kraken (Payward Inc)',
    balanceCents: 0,
    currency: 'USD',
    isExternal: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acct_stripe_balance',
    name: 'Stripe Balance',
    type: 'external',
    institution: 'Stripe',
    balanceCents: 0,
    currency: 'USD',
    isExternal: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acct_owner_equity',
    name: 'Owner Equity',
    type: 'external',
    institution: 'Internal',
    balanceCents: 0, // Negative = business owes you, Positive = you owe business
    currency: 'USD',
    isExternal: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acct_revenue',
    name: 'Revenue',
    type: 'external',
    institution: 'Internal',
    balanceCents: 0,
    currency: 'USD',
    isExternal: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acct_expenses',
    name: 'Business Expenses',
    type: 'external',
    institution: 'Internal',
    balanceCents: 0,
    currency: 'USD',
    isExternal: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
]

// ============================================================================
// Expense Categories (IRS Schedule C)
// ============================================================================

export const EXPENSE_CATEGORIES = {
  HOME_OFFICE: { id: 'home_office', name: 'Home Office', scheduleC: 30, description: 'Rent, utilities, insurance (% of home used)' },
  EQUIPMENT: { id: 'equipment', name: 'Equipment & Supplies', scheduleC: 22, description: 'Computer, monitors, desk, chair, etc.' },
  SOFTWARE: { id: 'software', name: 'Software & Subscriptions', scheduleC: 22, description: 'SaaS, tools, hosting, domains' },
  INTERNET: { id: 'internet', name: 'Internet & Phone', scheduleC: 25, description: 'Business % of internet, phone plan' },
  EDUCATION: { id: 'education', name: 'Education & Training', scheduleC: 27, description: 'Courses, books, certifications' },
  TRAVEL: { id: 'travel', name: 'Travel', scheduleC: 24, description: 'Business travel, mileage' },
  MEALS: { id: 'meals', name: 'Meals (50%)', scheduleC: 24, description: 'Business meals with clients (50% deductible)' },
  PROFESSIONAL: { id: 'professional', name: 'Professional Services', scheduleC: 17, description: 'Legal, accounting, consulting' },
  INSURANCE: { id: 'insurance', name: 'Business Insurance', scheduleC: 15, description: 'Liability, E&O insurance' },
  BANK_FEES: { id: 'bank_fees', name: 'Bank & Payment Fees', scheduleC: 27, description: 'Bank fees, Stripe fees, etc.' },
  MARKETING: { id: 'marketing', name: 'Marketing & Advertising', scheduleC: 8, description: 'Ads, promotions, branding' },
  OTHER: { id: 'other', name: 'Other Expenses', scheduleC: 27, description: 'Miscellaneous business expenses' },
} as const

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES

// Track expenses by category
let expensesByCategory: Record<string, { total: number; items: { date: string; amount: number; description: string }[] }> = {}

function initExpenseCategories() {
  for (const cat of Object.values(EXPENSE_CATEGORIES)) {
    expensesByCategory[cat.id] = { total: 0, items: [] }
  }
}
initExpenseCategories()

// In-memory state (would be DB in production)
let accounts = [...INTERNAL_ACCOUNTS]
let ledgerEntries: LedgerEntry[] = []
let transfers: Transfer[] = []

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ============================================================================
// Account Operations
// ============================================================================

export function getAccounts(): BankAccount[] {
  return accounts
}

export function getAccount(id: string): BankAccount | undefined {
  return accounts.find(a => a.id === id)
}

export function getAccountBalance(id: string): number {
  return getAccount(id)?.balanceCents || 0
}

export function getCashPosition() {
  const bankBalance = getAccountBalance('acct_fulton_checking')
  const cashOnHand = getAccountBalance('acct_cash_on_hand')
  const krakenBalance = getAccountBalance('acct_kraken')
  
  const pendingIn = transfers
    .filter(t => t.status === 'pending' && t.toAccountId === 'acct_fulton_checking')
    .reduce((sum, t) => sum + t.amountCents, 0)
  
  const pendingOut = transfers
    .filter(t => t.status === 'pending' && t.fromAccountId === 'acct_fulton_checking')
    .reduce((sum, t) => sum + t.amountCents, 0)
  
  return {
    bankBalance,
    cashOnHand,
    krakenBalance,
    totalLiquid: bankBalance + cashOnHand,
    totalAll: bankBalance + cashOnHand + krakenBalance,
    pendingIn,
    pendingOut,
  }
}

// ============================================================================
// Double-Entry Bookkeeping
// ============================================================================

/**
 * Record a double-entry transaction
 * 
 * DEBIT increases: Assets (cash, bank, crypto)
 * CREDIT increases: Liabilities, Equity, Revenue
 */
export function recordTransaction(params: {
  description: string
  entries: { accountId: string; type: 'debit' | 'credit'; amountCents: number }[]
  reference?: string
  metadata?: Record<string, unknown>
}): LedgerEntry {
  const { description, entries, reference, metadata } = params
  
  // Validate: debits must equal credits
  const totalDebits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amountCents, 0)
  const totalCredits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amountCents, 0)
  
  if (totalDebits !== totalCredits) {
    throw new Error(`Unbalanced transaction: debits (${totalDebits}) != credits (${totalCredits})`)
  }
  
  const entry: LedgerEntry = {
    id: generateId('txn'),
    timestamp: new Date().toISOString(),
    description,
    entries,
    metadata,
    status: 'posted',
    reference,
  }
  
  // Update account balances
  for (const e of entries) {
    const account = accounts.find(a => a.id === e.accountId)
    if (!account) throw new Error(`Account not found: ${e.accountId}`)
    
    // Asset accounts: debit increases, credit decreases
    // Liability/Equity/Revenue: credit increases, debit decreases
    const isAssetAccount = ['checking', 'savings', 'cash', 'crypto'].includes(account.type)
    
    if (isAssetAccount) {
      account.balanceCents += e.type === 'debit' ? e.amountCents : -e.amountCents
    } else {
      account.balanceCents += e.type === 'credit' ? e.amountCents : -e.amountCents
    }
    
    account.updatedAt = new Date().toISOString()
  }
  
  ledgerEntries.push(entry)
  return entry
}

export function getLedgerEntries(limit = 100): LedgerEntry[] {
  return ledgerEntries.slice(-limit).reverse()
}

// ============================================================================
// Transfer Operations
// ============================================================================

export function createTransfer(params: {
  fromAccountId: string
  toAccountId: string
  amountCents: number
  description: string
  method: Transfer['method']
  reference?: string
}): Transfer {
  const { fromAccountId, toAccountId, amountCents, description, method, reference } = params
  
  const fromAccount = getAccount(fromAccountId)
  const toAccount = getAccount(toAccountId)
  
  if (!fromAccount) throw new Error(`Source account not found: ${fromAccountId}`)
  if (!toAccount) throw new Error(`Destination account not found: ${toAccountId}`)
  
  // For internal/cash_deposit, complete immediately. ACH/wire are pending.
  const isImmediate = method === 'internal' || method === 'cash_deposit'
  
  const transfer: Transfer = {
    id: generateId('xfer'),
    fromAccountId,
    toAccountId,
    amountCents,
    description,
    status: isImmediate ? 'completed' : 'pending',
    method,
    reference,
    createdAt: new Date().toISOString(),
    completedAt: isImmediate ? new Date().toISOString() : undefined,
    estimatedArrival: method === 'ach' 
      ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // +2 days
      : method === 'wire'
      ? new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // +1 day
      : undefined,
  }
  
  // Record the ledger entry if completed
  if (transfer.status === 'completed') {
    recordTransaction({
      description,
      entries: [
        { accountId: fromAccountId, type: 'credit', amountCents },
        { accountId: toAccountId, type: 'debit', amountCents },
      ],
      reference: transfer.id,
      metadata: { transferId: transfer.id, method },
    })
  }
  
  transfers.push(transfer)
  return transfer
}

export function completeTransfer(transferId: string, reference?: string): Transfer {
  const transfer = transfers.find(t => t.id === transferId)
  if (!transfer) throw new Error(`Transfer not found: ${transferId}`)
  if (transfer.status !== 'pending') throw new Error(`Transfer not pending: ${transfer.status}`)
  
  transfer.status = 'completed'
  transfer.completedAt = new Date().toISOString()
  if (reference) transfer.reference = reference
  
  // Now post the ledger entry
  recordTransaction({
    description: transfer.description,
    entries: [
      { accountId: transfer.fromAccountId, type: 'credit', amountCents: transfer.amountCents },
      { accountId: transfer.toAccountId, type: 'debit', amountCents: transfer.amountCents },
    ],
    reference: transfer.id,
    metadata: { transferId: transfer.id, method: transfer.method },
  })
  
  return transfer
}

export function getTransfers(limit = 100): Transfer[] {
  return transfers.slice(-limit).reverse()
}

export function getPendingTransfers(): Transfer[] {
  return transfers.filter(t => t.status === 'pending')
}

export function getTransfer(id: string): Transfer | undefined {
  return transfers.find(t => t.id === id)
}

// ============================================================================
// Convenience Methods - The stuff you'll actually use
// ============================================================================

/**
 * Record cash income (client pays you cash)
 */
export function recordCashIncome(amountCents: number, clientName?: string, note?: string): LedgerEntry {
  return recordTransaction({
    description: `Cash income${clientName ? ` from ${clientName}` : ''}${note ? ` - ${note}` : ''}`,
    entries: [
      { accountId: 'acct_cash_on_hand', type: 'debit', amountCents },
      { accountId: 'acct_revenue', type: 'credit', amountCents },
    ],
    metadata: { clientName, note, type: 'CASH_INCOME' },
  })
}

/**
 * Record owner draw (pay yourself from the business)
 */
export function recordOwnerDraw(amountCents: number, note?: string): LedgerEntry {
  return recordTransaction({
    description: `Owner draw${note ? `: ${note}` : ''}`,
    entries: [
      { accountId: 'acct_owner_equity', type: 'debit', amountCents },
      { accountId: 'acct_cash_on_hand', type: 'credit', amountCents },
    ],
    metadata: { type: 'OWNER_DRAW', note },
  })
}

/**
 * Record capital contribution (add personal funds to business)
 */
export function recordCapitalContribution(amountCents: number, note?: string): LedgerEntry {
  return recordTransaction({
    description: `Capital contribution${note ? `: ${note}` : ''}`,
    entries: [
      { accountId: 'acct_cash_on_hand', type: 'debit', amountCents },
      { accountId: 'acct_owner_equity', type: 'credit', amountCents },
    ],
    metadata: { type: 'CAPITAL_CONTRIBUTION', note },
  })
}

/**
 * Deposit cash to Fulton Bank
 */
export function depositCashToBank(amountCents: number, note?: string): Transfer {
  return createTransfer({
    fromAccountId: 'acct_cash_on_hand',
    toAccountId: 'acct_fulton_checking',
    amountCents,
    description: `Cash deposit to Fulton${note ? `: ${note}` : ''}`,
    method: 'cash_deposit',
  })
}

/**
 * ACH transfer from Fulton to Kraken
 */
export function achToKraken(amountCents: number, note?: string): Transfer {
  return createTransfer({
    fromAccountId: 'acct_fulton_checking',
    toAccountId: 'acct_kraken',
    amountCents,
    description: `ACH to Kraken${note ? `: ${note}` : ''}`,
    method: 'ach',
  })
}

/**
 * Wire transfer from Fulton to Kraken (same-day)
 */
export function wireToKraken(amountCents: number, note?: string): Transfer {
  return createTransfer({
    fromAccountId: 'acct_fulton_checking',
    toAccountId: 'acct_kraken',
    amountCents,
    description: `Wire to Kraken${note ? `: ${note}` : ''}`,
    method: 'wire',
  })
}

/**
 * Record a business expense (paid from cash or bank)
 */
export function recordExpense(params: {
  amountCents: number
  category: string
  description: string
  paidFrom?: 'cash' | 'bank'
  vendor?: string
  receiptRef?: string
}): LedgerEntry {
  const { amountCents, category, description, paidFrom = 'cash', vendor, receiptRef } = params
  const fromAccount = paidFrom === 'bank' ? 'acct_fulton_checking' : 'acct_cash_on_hand'
  const categoryInfo = Object.values(EXPENSE_CATEGORIES).find(c => c.id === category)
  
  // Track in expense breakdown
  if (!expensesByCategory[category]) {
    expensesByCategory[category] = { total: 0, items: [] }
  }
  expensesByCategory[category].total += amountCents
  expensesByCategory[category].items.push({
    date: new Date().toISOString(),
    amount: amountCents,
    description: vendor ? `${vendor}: ${description}` : description,
  })
  
  return recordTransaction({
    description: `Expense: ${categoryInfo?.name || category} - ${description}${vendor ? ` (${vendor})` : ''}`,
    entries: [
      { accountId: 'acct_expenses', type: 'debit', amountCents },
      { accountId: fromAccount, type: 'credit', amountCents },
    ],
    metadata: { 
      type: 'EXPENSE', 
      category, 
      categoryName: categoryInfo?.name,
      scheduleC: categoryInfo?.scheduleC,
      vendor, 
      receiptRef,
      paidFrom,
    },
  })
}

/**
 * Get expenses breakdown by category
 */
export function getExpensesByCategory() {
  return Object.entries(expensesByCategory).map(([id, data]) => {
    const categoryInfo = Object.values(EXPENSE_CATEGORIES).find(c => c.id === id)
    return {
      id,
      name: categoryInfo?.name || id,
      scheduleC: categoryInfo?.scheduleC,
      total: data.total / 100,
      totalCents: data.total,
      itemCount: data.items.length,
      items: data.items.map(i => ({ ...i, amount: i.amount / 100 })),
    }
  }).filter(c => c.total > 0)
}

// ============================================================================
// Summary / Dashboard Data
// ============================================================================

export function getLedgerSummary() {
  const position = getCashPosition()
  const revenue = getAccountBalance('acct_revenue') / 100
  const expenses = getAccountBalance('acct_expenses') / 100
  const netIncome = revenue - expenses
  
  // Self-employment tax estimate (15.3% on 92.35% of net)
  const seTaxableBase = netIncome * 0.9235
  const selfEmploymentTax = seTaxableBase * 0.153
  
  // Rough income tax estimate (assume 22% marginal bracket)
  const taxableIncome = netIncome - (selfEmploymentTax / 2) // SE deduction
  const estimatedIncomeTax = taxableIncome > 0 ? taxableIncome * 0.22 : 0
  
  const estimatedTotalTax = selfEmploymentTax + estimatedIncomeTax
  const estimatedQuarterlyPayment = estimatedTotalTax / 4
  
  return {
    accounts: accounts.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      institution: a.institution,
      balance: a.balanceCents / 100,
      balanceCents: a.balanceCents,
      isExternal: a.isExternal,
      ...(a.routingNumber && { routingNumber: a.routingNumber }),
      ...(a.accountNumber && { accountNumberLast4: a.accountNumber.slice(-4) }),
    })),
    cashPosition: {
      bankBalance: position.bankBalance / 100,
      cashOnHand: position.cashOnHand / 100,
      krakenBalance: position.krakenBalance / 100,
      totalLiquid: position.totalLiquid / 100,
      totalAll: position.totalAll / 100,
      pendingIn: position.pendingIn / 100,
      pendingOut: position.pendingOut / 100,
    },
    recentTransactions: getLedgerEntries(20).map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      description: e.description,
      amount: e.entries[0]?.amountCents ? e.entries[0].amountCents / 100 : 0,
      status: e.status,
      metadata: e.metadata,
    })),
    pendingTransfers: getPendingTransfers().map(t => ({
      id: t.id,
      from: getAccount(t.fromAccountId)?.name || t.fromAccountId,
      to: getAccount(t.toAccountId)?.name || t.toAccountId,
      amount: t.amountCents / 100,
      method: t.method,
      status: t.status,
      createdAt: t.createdAt,
      estimatedArrival: t.estimatedArrival,
    })),
    totals: {
      revenue,
      expenses,
      netIncome,
      ownerEquity: getAccountBalance('acct_owner_equity') / 100,
    },
    expensesByCategory: getExpensesByCategory(),
    taxEstimate: {
      grossIncome: revenue,
      totalDeductions: expenses,
      netIncome,
      selfEmploymentTax,
      estimatedIncomeTax,
      estimatedTotalTax,
      estimatedQuarterlyPayment,
      effectiveRate: revenue > 0 ? (estimatedTotalTax / revenue) * 100 : 0,
    },
    expenseCategories: Object.values(EXPENSE_CATEGORIES),
  }
}

// ============================================================================
// Reset (for testing)
// ============================================================================

export function resetLedger(): void {
  accounts = INTERNAL_ACCOUNTS.map(a => ({ ...a, updatedAt: new Date().toISOString() }))
  // Reset balances
  accounts.find(a => a.id === 'acct_fulton_checking')!.balanceCents = -5000
  accounts.find(a => a.id === 'acct_cash_on_hand')!.balanceCents = 0
  accounts.find(a => a.id === 'acct_kraken')!.balanceCents = 0
  accounts.find(a => a.id === 'acct_owner_equity')!.balanceCents = 0
  accounts.find(a => a.id === 'acct_revenue')!.balanceCents = 0
  accounts.find(a => a.id === 'acct_expenses')!.balanceCents = 0
  ledgerEntries = []
  transfers = []
  // Reset expense tracking
  expensesByCategory = {}
  initExpenseCategories()
}
