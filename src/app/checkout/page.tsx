'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, ShoppingBag, Shield } from 'lucide-react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    stripePriceId?: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        setItems(cart);
        setIsLoaded(true);
    }, []);

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0; // Digital products, no tax
    const total = subtotal + tax;

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Call API to create Stripe Checkout Session
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'Failed to start checkout');
            setIsProcessing(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-matrix-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matrix-primary"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-matrix-black pt-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-12 text-center shadow-matrix">
                        <ShoppingBag className="w-16 h-16 text-matrix-text-secondary mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-matrix-text-primary mb-4">
                            Your cart is empty
                        </h1>
                        <p className="text-matrix-text-secondary mb-6">
                            Add some products to your cart before checking out
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-matrix-primary text-matrix-black rounded-lg hover:bg-matrix-secondary shadow-matrix font-semibold"
                        >
                            Browse shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-matrix-black text-matrix-text-primary pt-20">
            <div className="fixed inset-0 pointer-events-none opacity-[0.06]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 text-matrix-text-secondary hover:text-matrix-primary mb-8 font-mono"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to cart
                </Link>

                <h1 className="text-3xl font-bold text-matrix-text-primary mb-8 font-mono">
                    Checkout
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-6 shadow-matrix">
                        <h2 className="text-xl font-bold text-matrix-text-primary mb-4">
                            Order summary
                        </h2>

                        <div className="space-y-3 mb-6">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-matrix-text-primary">
                                            {item.name}
                                        </p>
                                        <p className="text-sm text-matrix-text-secondary">
                                            Quantity: {item.quantity}
                                        </p>
                                    </div>
                                    <span className="font-bold text-matrix-text-primary">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-matrix-border/30">
                            <div className="flex items-center justify-between text-matrix-text-secondary">
                                <span>Subtotal</span>
                                <span className="text-matrix-text-primary">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-matrix-text-secondary">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-matrix-border/30 pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-matrix-text-primary">
                                        Total
                                    </span>
                                    <span className="text-2xl font-bold text-matrix-text-primary">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-matrix-border/30 space-y-2 text-sm text-matrix-text-secondary">
                            <p>✅ Instant digital delivery</p>
                            <p>✅ Lifetime access</p>
                            <p>✅ Free updates</p>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-6 shadow-matrix flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-matrix-text-primary mb-4">
                                Payment
                            </h2>
                            <p className="text-matrix-text-secondary mb-6">
                                You'll be redirected to Stripe's secure checkout to complete your purchase.
                            </p>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-matrix-primary text-matrix-black rounded-lg hover:bg-matrix-secondary shadow-matrix transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-matrix-black"></div>
                                    Redirecting to Stripe...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Proceed to secure checkout
                                </>
                            )}
                        </button>

                        <p className="text-xs text-matrix-text-secondary mt-4 text-center flex items-center justify-center gap-2">
                            <Lock className="w-3 h-3" />
                            Powered by Stripe - Secure payment processing
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
