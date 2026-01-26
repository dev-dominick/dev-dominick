import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api-response'
import * as plaid from '@/lib/plaid'

/**
 * POST /api/plaid/webhook
 * Handle Plaid webhooks for real-time updates
 * 
 * Set this URL in your Plaid Dashboard:
 * https://yourdomain.com/api/plaid/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      webhook_type,
      webhook_code,
      item_id,
      error,
    } = body

    console.log(`Plaid webhook: ${webhook_type}/${webhook_code} for item ${item_id}`)

    if (error) {
      console.error('Plaid webhook error:', error)
    }

    // Handle the webhook
    await plaid.handleWebhook(webhook_type, webhook_code, item_id)

    return apiSuccess({ received: true })
  } catch (error) {
    console.error('Plaid webhook error:', error)
    return apiError('Webhook processing failed', 500)
  }
}
