import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { apiSuccess, apiError } from '@/lib/api-response'
import * as plaid from '@/lib/plaid'

/**
 * GET /api/plaid
 * Get Plaid connections and summary
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return apiError('Admin access required', 401)
    }

    if (!plaid.isPlaidConfigured()) {
      return apiSuccess({
        configured: false,
        message: 'Plaid not configured. Add PLAID_CLIENT_ID and PLAID_SECRET to .env.local',
        connections: [],
        summary: null,
      })
    }

    const connections = plaid.getConnections()
    const summary = plaid.getPlaidSummary()

    return apiSuccess({
      configured: true,
      connections,
      summary,
    })
  } catch (error) {
    console.error('Plaid GET error:', error)
    return apiError(error instanceof Error ? error.message : 'Failed to get Plaid data', 500)
  }
}

/**
 * POST /api/plaid
 * Actions: create_link_token, connect, sync, refresh, disconnect
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return apiError('Admin access required', 401)
    }

    if (!plaid.isPlaidConfigured()) {
      return apiError('Plaid not configured. Add PLAID_CLIENT_ID and PLAID_SECRET to .env.local', 400)
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create_link_token': {
        const linkToken = await plaid.createLinkToken('user_1')
        return apiSuccess({ linkToken })
      }

      case 'connect': {
        const { publicToken, institutionId, institutionName } = body
        if (!publicToken || !institutionId || !institutionName) {
          return apiError('publicToken, institutionId, and institutionName required', 400)
        }

        const connection = await plaid.createConnection({
          publicToken,
          institutionId,
          institutionName,
        })

        return apiSuccess({
          connection: {
            ...connection,
            accessToken: '***REDACTED***',
          },
          message: `Connected to ${institutionName}`,
        })
      }

      case 'sync': {
        const { connectionId } = body
        if (!connectionId) {
          return apiError('connectionId required', 400)
        }

        const result = await plaid.syncTransactions(connectionId)
        return apiSuccess({
          ...result,
          message: `Synced: ${result.added} added, ${result.modified} modified, ${result.removed} removed`,
        })
      }

      case 'refresh': {
        const { connectionId } = body
        if (!connectionId) {
          return apiError('connectionId required', 400)
        }

        const accounts = await plaid.refreshBalances(connectionId)
        return apiSuccess({
          accounts,
          message: 'Balances refreshed',
        })
      }

      case 'disconnect': {
        const { connectionId } = body
        if (!connectionId) {
          return apiError('connectionId required', 400)
        }

        await plaid.removeConnection(connectionId)
        return apiSuccess({ message: 'Connection removed' })
      }

      case 'sync_all': {
        const connections = plaid.getConnections()
        const results = []

        for (const conn of connections) {
          try {
            const result = await plaid.syncTransactions(conn.id)
            results.push({ connectionId: conn.id, ...result })
          } catch (err) {
            results.push({ connectionId: conn.id, error: err instanceof Error ? err.message : 'Sync failed' })
          }
        }

        return apiSuccess({ results })
      }

      default:
        return apiError(`Unknown action: ${action}`, 400)
    }
  } catch (error) {
    console.error('Plaid POST error:', error)
    return apiError(error instanceof Error ? error.message : 'Plaid operation failed', 500)
  }
}
