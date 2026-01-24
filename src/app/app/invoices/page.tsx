'use client'

import { useEffect, useState } from 'react'
import { Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  priceAtTime: number
}

interface Order {
  id: string
  stripeSessionId: string
  total: number
  currency: string
  status: string
  customerEmail: string
  customerName?: string
  items: OrderItem[]
  createdAt: string
  completedAt?: string
}

export default function InvoicesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-matrix-primary mx-auto mb-4"></div>
          <p className="text-matrix-text-secondary">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-matrix-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-matrix-text-primary font-mono mb-2">Invoices & Orders</h1>
          <p className="text-matrix-text-secondary">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 border border-matrix-border/20 rounded-lg bg-matrix-darker">
                <p className="text-matrix-text-secondary mb-4">No orders yet</p>
                <p className="text-sm text-matrix-text-muted">When you purchase products, they'll appear here.</p>
              </div>
            ) : (
              orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedOrder?.id === order.id
                      ? 'border-matrix-primary bg-matrix-darker/50'
                      : 'border-matrix-border/20 hover:border-matrix-border/50 bg-matrix-darker'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm text-matrix-text-muted">Order #{order.id.substring(0, 8)}</p>
                      <p className="font-semibold text-matrix-text-primary text-lg">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="text-right">
                      {order.status === 'completed' && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                          Completed
                        </span>
                      )}
                      {order.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      )}
                      {order.status === 'refunded' && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                          Refunded
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-matrix-text-secondary mb-2">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>

                  <p className="text-xs text-matrix-text-muted">
                    {formatDate(order.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker h-fit sticky top-4">
              <h2 className="text-lg font-bold text-matrix-text-primary mb-4 font-mono">
                Invoice Details
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-mono text-matrix-text-muted mb-1">ORDER ID</p>
                  <p className="font-mono text-matrix-text-primary">{selectedOrder.id}</p>
                </div>

                <div className="border-t border-matrix-border/20 pt-4">
                  <p className="text-xs font-mono text-matrix-text-muted mb-2">ITEMS</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-matrix-text-secondary">Product</span>
                        <span className="text-matrix-text-primary">
                          {item.quantity} × {(item.priceAtTime / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-matrix-border/20 pt-4">
                  <p className="text-xs font-mono text-matrix-text-muted mb-2">SUMMARY</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-matrix-text-secondary">Subtotal</span>
                      <span className="text-matrix-text-primary">
                        {(selectedOrder.total / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-matrix-border/20">
                      <span className="text-matrix-text-secondary">Total</span>
                      <span className="text-matrix-primary">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-matrix-border/20 pt-4">
                  <p className="text-xs font-mono text-matrix-text-muted mb-1">STATUS</p>
                  <p className="text-matrix-text-primary capitalize">
                    {selectedOrder.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-mono text-matrix-text-muted mb-1">DATE</p>
                  <p className="text-matrix-text-primary">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
