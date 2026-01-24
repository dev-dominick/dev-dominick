'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui'

interface StripePaymentFormProps {
  projectName: string
  amount: number
  description?: string
  onSuccess?: () => void
}

export function StripePaymentForm({
  projectName,
  amount,
  description,
  onSuccess,
}: StripePaymentFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    if (!session) {
      setError('Please sign in to proceed with payment')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create payment intent
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          projectName,
          description,
        }),
      })

      if (!res.ok) throw new Error('Failed to create payment')

      const { clientSecret, paymentIntentId } = await res.json()

      // Show success message
      alert(`Payment initiated for $${amount} - Intent ID: ${paymentIntentId}`)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-500 text-sm">
          {error}
        </div>
      )}
      <Button
        onClick={handlePayment}
        disabled={loading || !session}
        className="w-full"
      >
        {loading ? 'Processing...' : `Pay $${amount} for ${projectName}`}
      </Button>
      {!session && (
        <p className="text-sm text-gray-400">Sign in to make a payment</p>
      )}
    </div>
  )
}
