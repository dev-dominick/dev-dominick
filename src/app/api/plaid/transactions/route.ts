import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { apiSuccess, apiError } from '@/lib/api-response'
import * as plaid from '@/lib/plaid'

/**
 * GET /api/plaid/transactions
 * Get synced transactions with filtering
 * 
 * Query params:
 * - connectionId: Filter by connection
 * - accountId: Filter by account
 * - startDate: YYYY-MM-DD
 * - endDate: YYYY-MM-DD
 * - limit: Max results (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return apiError('Admin access required', 401)
    }

    const { searchParams } = new URL(request.url)
    
    const transactions = plaid.getTransactions({
      connectionId: searchParams.get('connectionId') || undefined,
      accountId: searchParams.get('accountId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
    })

    // Calculate summary
    const income = transactions
      .filter(t => t.amount < 0 && !t.pending)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const spending = transactions
      .filter(t => t.amount > 0 && !t.pending)
      .reduce((sum, t) => sum + t.amount, 0)

    return apiSuccess({
      transactions,
      count: transactions.length,
      summary: {
        income,
        spending,
        net: income - spending,
      },
    })
  } catch (error) {
    console.error('Transactions GET error:', error)
    return apiError(error instanceof Error ? error.message : 'Failed to get transactions', 500)
  }
}
