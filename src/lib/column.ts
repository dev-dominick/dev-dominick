/**
 * Column API Integration
 * https://column.com/docs
 * 
 * Column provides banking infrastructure APIs for:
 * - ACH origination (debit/credit)
 * - Wire transfers
 * - Real-time payments
 * - Account management
 * 
 * Pricing: ~$0.25-0.50 per ACH (vs Stripe's 0.8%)
 */

const COLUMN_API_BASE = 'https://api.column.com'
const COLUMN_API_KEY = process.env.COLUMN_API_KEY || ''

interface ColumnConfig {
  apiKey: string
  baseUrl: string
  environment: 'sandbox' | 'production'
}

const config: ColumnConfig = {
  apiKey: COLUMN_API_KEY,
  baseUrl: COLUMN_API_KEY.startsWith('test_') 
    ? 'https://api.column.com' // Sandbox uses same URL, different key prefix
    : COLUMN_API_BASE,
  environment: COLUMN_API_KEY.startsWith('test_') ? 'sandbox' : 'production',
}

// ============================================================================
// Types
// ============================================================================

export interface ColumnBankAccount {
  id: string
  routing_number: string
  account_number: string
  account_type: 'checking' | 'savings'
  bank_name?: string
  description?: string
  created_at: string
}

export interface ColumnCounterparty {
  id: string
  routing_number: string
  account_number: string
  account_type: 'checking' | 'savings'
  name: string
  description?: string
  created_at: string
}

export interface ACHTransfer {
  id: string
  amount: number // in cents
  currency: string
  type: 'credit' | 'debit'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'returned'
  counterparty_id: string
  bank_account_id: string
  description?: string
  created_at: string
  completed_at?: string
  return_code?: string
  return_reason?: string
}

export interface WireTransfer {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  counterparty_id: string
  bank_account_id: string
  description?: string
  created_at: string
  completed_at?: string
}

// ============================================================================
// API Client
// ============================================================================

async function columnFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!config.apiKey) {
    throw new Error('COLUMN_API_KEY not configured')
  }

  // Column uses Basic Auth with API key as username, empty password
  const credentials = Buffer.from(`${config.apiKey}:`).toString('base64')

  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `Column API error (${response.status}): ${response.statusText}`
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch {
      if (errorText) errorMessage = errorText
    }
    throw new Error(errorMessage)
  }

  const text = await response.text()
  if (!text) return {} as T
  return JSON.parse(text)
}

// ============================================================================
// Bank Accounts
// ============================================================================

export async function listBankAccounts(): Promise<ColumnBankAccount[]> {
  const res = await columnFetch<{ bank_accounts: ColumnBankAccount[] }>('/bank-accounts')
  return res.bank_accounts
}

export async function getBankAccount(id: string): Promise<ColumnBankAccount> {
  return columnFetch<ColumnBankAccount>(`/bank-accounts/${id}`)
}

// ============================================================================
// Counterparties (External Accounts)
// ============================================================================

export interface CreateCounterpartyInput {
  routing_number: string
  account_number: string
  account_type: 'checking' | 'savings'
  name: string
  description?: string
}

export async function createCounterparty(input: CreateCounterpartyInput): Promise<ColumnCounterparty> {
  return columnFetch<ColumnCounterparty>('/counterparties', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function listCounterparties(): Promise<ColumnCounterparty[]> {
  const res = await columnFetch<{ counterparties: ColumnCounterparty[] }>('/counterparties')
  return res.counterparties
}

export async function getCounterparty(id: string): Promise<ColumnCounterparty> {
  return columnFetch<ColumnCounterparty>(`/counterparties/${id}`)
}

// ============================================================================
// ACH Transfers
// ============================================================================

export interface CreateACHTransferInput {
  amount: number // in cents
  type: 'credit' | 'debit' // credit = send money, debit = pull money
  counterparty_id: string
  bank_account_id: string
  description?: string
  // Same-day ACH (slightly higher fee)
  same_day?: boolean
}

/**
 * Initiate an ACH transfer
 * 
 * Credit = Push money TO counterparty (pay someone)
 * Debit = Pull money FROM counterparty (collect payment)
 * 
 * Standard ACH: 1-3 business days
 * Same-day ACH: Same business day (cutoff times apply)
 */
export async function createACHTransfer(input: CreateACHTransferInput): Promise<ACHTransfer> {
  return columnFetch<ACHTransfer>('/ach-transfers', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      currency: 'USD',
    }),
  })
}

export async function getACHTransfer(id: string): Promise<ACHTransfer> {
  return columnFetch<ACHTransfer>(`/ach-transfers/${id}`)
}

export async function listACHTransfers(params?: {
  status?: ACHTransfer['status']
  limit?: number
}): Promise<ACHTransfer[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  
  const query = searchParams.toString()
  const res = await columnFetch<{ ach_transfers: ACHTransfer[] }>(
    `/ach-transfers${query ? `?${query}` : ''}`
  )
  return res.ach_transfers
}

// ============================================================================
// Wire Transfers
// ============================================================================

export interface CreateWireTransferInput {
  amount: number // in cents
  counterparty_id: string
  bank_account_id: string
  description?: string
}

/**
 * Initiate a wire transfer (same-day, irrevocable)
 * 
 * Wires are:
 * - Same-day settlement
 * - Cannot be reversed
 * - Higher fee than ACH (~$15-25 vs $0.25)
 * - Good for large, time-sensitive transfers
 */
export async function createWireTransfer(input: CreateWireTransferInput): Promise<WireTransfer> {
  return columnFetch<WireTransfer>('/wire-transfers', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      currency: 'USD',
    }),
  })
}

export async function getWireTransfer(id: string): Promise<WireTransfer> {
  return columnFetch<WireTransfer>(`/wire-transfers/${id}`)
}

// ============================================================================
// Balance
// ============================================================================

export interface AccountBalance {
  available: number // in cents
  pending: number
  currency: string
}

export async function getAccountBalance(bankAccountId: string): Promise<AccountBalance> {
  return columnFetch<AccountBalance>(`/bank-accounts/${bankAccountId}/balance`)
}

// ============================================================================
// Webhooks
// ============================================================================

export type ColumnWebhookEvent = 
  | { type: 'ach_transfer.completed'; data: ACHTransfer }
  | { type: 'ach_transfer.failed'; data: ACHTransfer }
  | { type: 'ach_transfer.returned'; data: ACHTransfer }
  | { type: 'wire_transfer.completed'; data: WireTransfer }
  | { type: 'wire_transfer.failed'; data: WireTransfer }

/**
 * Verify webhook signature
 * Column signs webhooks with HMAC-SHA256
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

// ============================================================================
// Utilities
// ============================================================================

export function isConfigured(): boolean {
  return !!config.apiKey
}

export function getEnvironment(): 'sandbox' | 'production' {
  return config.environment
}

/**
 * Common routing numbers
 */
export const ROUTING_NUMBERS = {
  FULTON_BANK: '031301422',
  WELLS_FARGO_PA: '031000503',
  WELLS_FARGO_CA: '121042882',
} as const
