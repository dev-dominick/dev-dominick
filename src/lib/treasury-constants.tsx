import { CheckCircle, Clock, XCircle, Send } from 'lucide-react'
import type { ReactNode } from 'react'

export const METHOD_COLORS: Record<string, string> = {
  CASH: 'bg-green-500/20 text-green-400',
  STRIPE: 'bg-purple-500/20 text-purple-400',
  ACH: 'bg-blue-500/20 text-blue-400',
  WIRE: 'bg-yellow-500/20 text-yellow-400',
  CHECK: 'bg-orange-500/20 text-orange-400',
  OTHER: 'bg-gray-500/20 text-gray-400',
}

export const STATUS_ICONS: Record<string, ReactNode> = {
  RECEIVED: <CheckCircle className="w-4 h-4 text-green-400" />,
  PENDING: <Clock className="w-4 h-4 text-yellow-400" />,
  FAILED: <XCircle className="w-4 h-4 text-red-400" />,
  REFUNDED: <XCircle className="w-4 h-4 text-orange-400" />,
  PLANNED: <Clock className="w-4 h-4 text-blue-400" />,
  SUBMITTED: <Send className="w-4 h-4 text-yellow-400" />,
  CONFIRMED: <CheckCircle className="w-4 h-4 text-green-400" />,
  CANCELED: <XCircle className="w-4 h-4 text-red-400" />,
}

export const INITIAL_PAYMENT_FORM = {
  amountUsd: '',
  method: 'CASH',
  clientName: '',
  clientEmail: '',
  notes: '',
  externalRef: '',
}

export const INITIAL_TRANSFER_FORM = {
  amountUsd: '',
  sourceAccount: 'FULTON_BANK',
  method: 'ACH',
  notes: '',
  paymentReceiptId: '',
}
