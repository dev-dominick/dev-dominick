'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, ShoppingBag, Shield } from 'lucide-react';
import { getProductById } from '@/lib/catalog';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    stripePriceId: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const currency = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        const normalized: CartItem[] = (cart as CartItem[])
            .map((item) => {
                const catalogProduct = getProductById(item.id);
                return {
                    ...item,
                    stripePriceId: item.stripePriceId || catalogProduct?.stripePriceId || '',
                };
            })
            .filter((item) => item.stripePriceId);

        setItems(normalized);
        setIsLoaded(true);
    }, []);

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0; // Digital products, no tax
    const total = subtotal + tax;

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const itemsMissingPriceId = items.filter((item) => !item.stripePriceId);
            if (itemsMissingPriceId.length) {
                throw new Error('One or more items are missing a Stripe price. Please re-add them to the cart.');
            }

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
                    <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker p-12 text-center shadow-soft">
                        <ShoppingBag className="w-16 h-16 text-matrix-text-secondary mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-matrix-text-primary mb-4">
                            Your cart is empty
                        </h1>
                        <p className="text-matrix-text-secondary mb-6">
                            Add some products to your cart before checking out
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-matrix-primary text-matrix-black rounded-lg hover:brightness-110 shadow-soft font-semibold"
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
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 text-matrix-text-secondary hover:text-matrix-primary mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to cart
                </Link>

                <h1 className="text-3xl font-bold text-matrix-text-primary mb-2">
                    Checkout
                </h1>
                <p className="text-matrix-text-secondary mb-8">You’re booking a paid consultation. After payment, we’ll confirm details and share scheduling. Questions? <Link href="/contact" className="text-matrix-primary hover:brightness-110">Contact us</Link> anytime.</p>

                {error && (
                    <div className="mb-6 p-4 bg-danger/10 border border-danger/50 rounded-lg">
                        <p className="text-danger">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker p-6 shadow-soft">
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
                                        {currency.format(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-matrix-border/40">
                            <div className="flex items-center justify-between text-matrix-text-secondary">
                                <span>Subtotal</span>
                                <span className="text-matrix-text-primary">{currency.format(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-matrix-text-secondary">
                                <span>Tax</span>
                                <span>{currency.format(tax)}</span>
                            </div>
                            <div className="border-t border-matrix-border/40 pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-matrix-text-primary">
                                        Total
                                    </span>
                                    <span className="text-2xl font-bold text-matrix-text-primary">
                                        {currency.format(total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-matrix-border/40 space-y-2 text-sm text-matrix-text-secondary">
                            <p>✅ Instant digital delivery</p>
                            <p>✅ Lifetime access</p>
                            <p>✅ Free updates</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker p-6 shadow-soft flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-matrix-text-primary mb-4">
                                Payment
                            </h2>
                            <p className="text-matrix-text-secondary mb-6">
                                Secure Stripe checkout. You'll get instant access to download your kit and documentation. Need help deploying? Let's talk.
                            </p>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-matrix-primary text-matrix-black rounded-lg hover:brightness-110 shadow-soft transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
