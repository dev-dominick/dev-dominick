/**
 * Plaid Integration
 * Connect real bank accounts and sync transactions automatically
 * 
 * Like Monarch, Mint, Copilot - but yours.
 */

import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
  TransactionsSyncRequest,
  DepositoryAccountSubtype,
} from 'plaid'

// ============================================================================
// Configuration
// ============================================================================

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || ''
const PLAID_SECRET = process.env.PLAID_SECRET || ''
const PLAID_ENV = (process.env.PLAID_ENV || 'sandbox') as 'sandbox' | 'development' | 'production'

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

// ============================================================================
// Types
// ============================================================================

export interface PlaidConnection {
  id: string
  itemId: string
  accessToken: string
  institutionId: string
  institutionName: string
  accounts: PlaidAccount[]
  cursor?: string // For transaction sync
  lastSync?: string
  status: 'active' | 'error' | 'pending_reauth'
  createdAt: string
  updatedAt: string
}

export interface PlaidAccount {
  accountId: string
  name: string
  officialName?: string
  type: string
  subtype?: string
  mask?: string
  balanceCurrent?: number
  balanceAvailable?: number
  balanceLimit?: number
  isoCurrencyCode?: string
}

export interface PlaidTransaction {
  id: string
  accountId: string
  connectionId: string
  plaidTransactionId: string
  amount: number
  date: string
  name: string
  merchantName?: string
  category?: string[]
  categoryId?: string
  pending: boolean
  paymentChannel: string
  location?: {
    address?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
  }
  personalFinanceCategory?: {
    primary: string
    detailed: string
  }
  syncedAt: string
}

// ============================================================================
// In-memory storage (would be DB in production)
// ============================================================================

let connections: PlaidConnection[] = []
let transactions: PlaidTransaction[] = []

// ============================================================================
// Link Token - Creates a token for Plaid Link UI
// ============================================================================

export async function createLinkToken(userId: string) {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('Plaid credentials not configured')
  }

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Dominick Treasury',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
    // Enable account selection
    account_filters: {
      depository: {
        account_subtypes: [DepositoryAccountSubtype.Checking, DepositoryAccountSubtype.Savings],
      },
    },
  })

  return response.data.link_token
}

// ============================================================================
// Exchange Public Token - After user connects in Plaid Link
// ============================================================================

export async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  })

  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  }
}

// ============================================================================
// Get Institution Info
// ============================================================================

export async function getInstitution(institutionId: string) {
  const response = await plaidClient.institutionsGetById({
    institution_id: institutionId,
    country_codes: [CountryCode.Us],
  })

  return response.data.institution
}

// ============================================================================
// Get Accounts for a connection
// ============================================================================

export async function getAccounts(accessToken: string) {
  const response = await plaidClient.accountsGet({
    access_token: accessToken,
  })

  return response.data.accounts.map(account => ({
    accountId: account.account_id,
    name: account.name,
    officialName: account.official_name || undefined,
    type: account.type,
    subtype: account.subtype || undefined,
    mask: account.mask || undefined,
    balanceCurrent: account.balances.current || undefined,
    balanceAvailable: account.balances.available || undefined,
    balanceLimit: account.balances.limit || undefined,
    isoCurrencyCode: account.balances.iso_currency_code || undefined,
  }))
}

// ============================================================================
// Create Connection (after successful Plaid Link)
// ============================================================================

export async function createConnection(params: {
  publicToken: string
  institutionId: string
  institutionName: string
}): Promise<PlaidConnection> {
  const { publicToken, institutionId, institutionName } = params

  // Exchange token
  const { accessToken, itemId } = await exchangePublicToken(publicToken)

  // Get accounts
  const accounts = await getAccounts(accessToken)

  const connection: PlaidConnection = {
    id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    itemId,
    accessToken,
    institutionId,
    institutionName,
    accounts,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  connections.push(connection)

  // Initial transaction sync
  await syncTransactions(connection.id)

  return connection
}

// ============================================================================
// Sync Transactions using Plaid's sync endpoint
// ============================================================================

export async function syncTransactions(connectionId: string): Promise<{
  added: number
  modified: number
  removed: number
}> {
  const connection = connections.find(c => c.id === connectionId)
  if (!connection) throw new Error('Connection not found')

  let hasMore = true
  let added = 0
  let modified = 0
  let removed = 0
  let cursor = connection.cursor

  while (hasMore) {
    const request: TransactionsSyncRequest = {
      access_token: connection.accessToken,
      cursor: cursor || undefined,
      count: 500,
    }

    const response = await plaidClient.transactionsSync(request)
    const data = response.data

    // Process added transactions
    for (const tx of data.added) {
      const transaction: PlaidTransaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        accountId: tx.account_id,
        connectionId,
        plaidTransactionId: tx.transaction_id,
        amount: tx.amount, // Plaid: positive = money leaving, negative = money coming in
        date: tx.date,
        name: tx.name,
        merchantName: tx.merchant_name || undefined,
        category: tx.category || undefined,
        categoryId: tx.category_id || undefined,
        pending: tx.pending,
        paymentChannel: tx.payment_channel,
        location: tx.location ? {
          address: tx.location.address || undefined,
          city: tx.location.city || undefined,
          region: tx.location.region || undefined,
          postalCode: tx.location.postal_code || undefined,
          country: tx.location.country || undefined,
        } : undefined,
        personalFinanceCategory: tx.personal_finance_category ? {
          primary: tx.personal_finance_category.primary,
          detailed: tx.personal_finance_category.detailed,
        } : undefined,
        syncedAt: new Date().toISOString(),
      }

      // Check for duplicate
      const existing = transactions.find(t => t.plaidTransactionId === tx.transaction_id)
      if (!existing) {
        transactions.push(transaction)
        added++
      }
    }

    // Process modified transactions
    for (const tx of data.modified) {
      const idx = transactions.findIndex(t => t.plaidTransactionId === tx.transaction_id)
      if (idx !== -1) {
        transactions[idx] = {
          ...transactions[idx],
          amount: tx.amount,
          date: tx.date,
          name: tx.name,
          merchantName: tx.merchant_name || undefined,
          pending: tx.pending,
          syncedAt: new Date().toISOString(),
        }
        modified++
      }
    }

    // Process removed transactions
    for (const removed_tx of data.removed) {
      const idx = transactions.findIndex(t => t.plaidTransactionId === removed_tx.transaction_id)
      if (idx !== -1) {
        transactions.splice(idx, 1)
        removed++
      }
    }

    hasMore = data.has_more
    cursor = data.next_cursor
  }

  // Update connection cursor
  connection.cursor = cursor
  connection.lastSync = new Date().toISOString()
  connection.updatedAt = new Date().toISOString()

  return { added, modified, removed }
}

// ============================================================================
// Refresh Balances
// ============================================================================

export async function refreshBalances(connectionId: string): Promise<PlaidAccount[]> {
  const connection = connections.find(c => c.id === connectionId)
  if (!connection) throw new Error('Connection not found')

  const accounts = await getAccounts(connection.accessToken)
  connection.accounts = accounts
  connection.updatedAt = new Date().toISOString()

  return accounts
}

// ============================================================================
// Get Data
// ============================================================================

export function getConnections(): PlaidConnection[] {
  return connections.map(c => ({
    ...c,
    accessToken: '***REDACTED***', // Never expose access tokens
  }))
}

export function getConnection(id: string): PlaidConnection | undefined {
  const conn = connections.find(c => c.id === id)
  if (!conn) return undefined
  return {
    ...conn,
    accessToken: '***REDACTED***',
  }
}

export function getTransactions(params?: {
  connectionId?: string
  accountId?: string
  startDate?: string
  endDate?: string
  limit?: number
}): PlaidTransaction[] {
  let result = [...transactions]

  if (params?.connectionId) {
    result = result.filter(t => t.connectionId === params.connectionId)
  }
  if (params?.accountId) {
    result = result.filter(t => t.accountId === params.accountId)
  }
  if (params?.startDate) {
    result = result.filter(t => t.date >= params.startDate!)
  }
  if (params?.endDate) {
    result = result.filter(t => t.date <= params.endDate!)
  }

  // Sort by date descending
  result.sort((a, b) => b.date.localeCompare(a.date))

  if (params?.limit) {
    result = result.slice(0, params.limit)
  }

  return result
}

// ============================================================================
// Remove Connection
// ============================================================================

export async function removeConnection(connectionId: string): Promise<void> {
  const connection = connections.find(c => c.id === connectionId)
  if (!connection) throw new Error('Connection not found')

  // Remove from Plaid
  await plaidClient.itemRemove({
    access_token: connection.accessToken,
  })

  // Remove local data
  connections = connections.filter(c => c.id !== connectionId)
  transactions = transactions.filter(t => t.connectionId !== connectionId)
}

// ============================================================================
// Get Aggregated Summary
// ============================================================================

export function getPlaidSummary() {
  const allAccounts = connections.flatMap(c => 
    c.accounts.map(a => ({
      ...a,
      connectionId: c.id,
      institutionName: c.institutionName,
    }))
  )

  const totalBalance = allAccounts.reduce((sum, a) => sum + (a.balanceCurrent || 0), 0)
  const totalAvailable = allAccounts.reduce((sum, a) => sum + (a.balanceAvailable || 0), 0)

  // Transaction stats for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentTxns = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo && !t.pending)

  const income = recentTxns
    .filter(t => t.amount < 0) // Negative = money coming in
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const spending = recentTxns
    .filter(t => t.amount > 0) // Positive = money going out
    .reduce((sum, t) => sum + t.amount, 0)

  // Spending by category
  const spendingByCategory: Record<string, number> = {}
  recentTxns.filter(t => t.amount > 0).forEach(t => {
    const category = t.personalFinanceCategory?.primary || t.category?.[0] || 'Uncategorized'
    spendingByCategory[category] = (spendingByCategory[category] || 0) + t.amount
  })

  return {
    connections: connections.length,
    accounts: allAccounts,
    totalBalance,
    totalAvailable,
    last30Days: {
      income,
      spending,
      netCashflow: income - spending,
      transactionCount: recentTxns.length,
      spendingByCategory,
    },
    recentTransactions: transactions.slice(0, 20),
  }
}

// ============================================================================
// Webhook Handler
// ============================================================================

export async function handleWebhook(webhookType: string, webhookCode: string, itemId: string) {
  const connection = connections.find(c => c.itemId === itemId)
  if (!connection) {
    console.warn(`Webhook received for unknown item: ${itemId}`)
    return
  }

  switch (webhookType) {
    case 'TRANSACTIONS':
      if (webhookCode === 'SYNC_UPDATES_AVAILABLE') {
        // New transactions available - sync them
        await syncTransactions(connection.id)
      } else if (webhookCode === 'DEFAULT_UPDATE') {
        // Historical transactions ready (initial sync)
        await syncTransactions(connection.id)
      }
      break

    case 'ITEM':
      if (webhookCode === 'ERROR') {
        connection.status = 'error'
        connection.updatedAt = new Date().toISOString()
      } else if (webhookCode === 'PENDING_EXPIRATION') {
        connection.status = 'pending_reauth'
        connection.updatedAt = new Date().toISOString()
      }
      break

    default:
      console.log(`Unhandled webhook: ${webhookType}/${webhookCode}`)
  }
}

// ============================================================================
// Reset (for testing)
// ============================================================================

export function resetPlaid(): void {
  connections = []
  transactions = []
}

// ============================================================================
// Check if configured
// ============================================================================

export function isPlaidConfigured(): boolean {
  return Boolean(PLAID_CLIENT_ID && PLAID_SECRET)
}
