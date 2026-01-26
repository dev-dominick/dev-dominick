"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerEmail?: string;
  total: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-matrix-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-matrix-text-primary">Orders</h1>
            <p className="text-matrix-text-secondary">Paid consultations and shop purchases</p>
          </div>
          <Button variant="ghost" onClick={fetchOrders} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-matrix-text-secondary">Loading orders...</div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4 text-red-100">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-matrix-border/30 bg-matrix-darker p-8 text-center">
            <ShoppingBag className="w-10 h-10 text-matrix-text-muted mx-auto mb-3" />
            <p className="text-matrix-text-secondary">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-matrix-border/30 bg-matrix-darker p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-matrix-text-muted">Order</p>
                    <p className="text-lg font-semibold text-matrix-text-primary">{order.id}</p>
                    <p className="text-sm text-matrix-text-secondary">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-matrix-text-muted">Amount</p>
                    <p className="text-xl font-bold text-matrix-text-primary">
                      ${(order.total / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-matrix-text-secondary capitalize">{order.status}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-matrix-border/20 pt-4">
                  {order.customerEmail && (
                    <p className="text-sm text-matrix-text-secondary mb-2">
                      Customer: <span className="text-matrix-text-primary">{order.customerEmail}</span>
                    </p>
                  )}
                  {order.items && order.items.length > 0 ? (
                    <ul className="space-y-2 text-sm text-matrix-text-secondary">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span>{item.name} × {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-matrix-text-secondary">No line items recorded.</p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Link href="/admin/appointments" className="text-matrix-primary hover:underline">
                    View appointments
                  </Link>
                  <span className="text-matrix-text-muted">·</span>
                  <Link href="/admin/contact-messages" className="text-matrix-primary hover:underline">
                    Messages
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
