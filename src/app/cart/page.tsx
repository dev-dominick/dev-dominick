"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, UserPlus } from "lucide-react";
import { AuthModal } from "@/components/shop/AuthModal";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: string;
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        setItems(cart);
        setIsLoaded(true);
    }, []);

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        const updated = items.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
        setItems(updated);
        localStorage.setItem('shop_cart', JSON.stringify(updated));
    };

    const removeItem = (id: string) => {
        const updated = items.filter(item => item.id !== id);
        setItems(updated);
        localStorage.setItem('shop_cart', JSON.stringify(updated));
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-matrix-black flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-matrix-primary"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-matrix-black pt-20">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-14 text-center shadow-matrix">
                        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-matrix-text-secondary" />
                        <h2 className="mb-2 text-2xl font-bold text-matrix-text-primary">Your cart is empty</h2>
                        <p className="mb-6 text-matrix-text-secondary">Start shopping to add items.</p>
                        <Link
                            href="/shop"
                            className="inline-block rounded-lg bg-matrix-primary px-6 py-3 font-semibold text-matrix-black hover:bg-matrix-secondary shadow-matrix"
                        >
                            Browse shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-matrix-black pt-20 text-matrix-text-primary">
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
            <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Cart ({itemCount} {itemCount === 1 ? "item" : "items"})</h1>
                    <button
                        onClick={() => setShowAuth(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-matrix-border/60 px-4 py-2 text-sm font-mono text-matrix-text-secondary hover:border-matrix-primary hover:text-matrix-primary"
                    >
                        <UserPlus className="h-4 w-4" />
                        Sign in / up
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="space-y-4 lg:col-span-2">
                        {items.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-6 shadow-matrix">
                                <div className="flex gap-4">
                                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-matrix-border/50 bg-matrix-black/70 text-2xl font-bold text-matrix-primary">
                                        {item.name.charAt(0)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                                <p className="text-sm capitalize text-matrix-text-secondary">{item.type}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="rounded-lg p-2 text-red-400 hover:bg-red-900/20"
                                                title="Remove from cart"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="rounded-lg border border-matrix-border/60 p-2 hover:border-matrix-primary/60 disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="rounded-lg border border-matrix-border/60 p-2 hover:border-matrix-primary/60"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-matrix-text-primary">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-sm text-matrix-text-secondary">
                                                        ${item.price.toFixed(2)} each
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-6 shadow-matrix">
                            <h2 className="mb-6 text-xl font-bold">Order summary</h2>

                            <div className="mb-6 space-y-3 text-matrix-text-secondary">
                                <div className="flex items-center justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-matrix-text-primary">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Tax</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="border-t border-matrix-border/30 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-matrix-text-primary">Total</span>
                                        <span className="text-2xl font-bold text-matrix-text-primary">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-matrix-primary px-6 py-3 font-semibold text-matrix-black shadow-matrix hover:bg-matrix-secondary"
                            >
                                Proceed to checkout
                                <ArrowRight className="h-5 w-5" />
                            </Link>

                            <button
                                onClick={() => setShowAuth(true)}
                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-matrix-border/60 px-6 py-3 text-sm font-mono text-matrix-text-secondary hover:border-matrix-primary hover:text-matrix-primary"
                            >
                                <Shield className="h-4 w-4" />
                                Sign in to save orders
                            </button>

                            <Link
                                href="/shop"
                                className="block w-full text-center rounded-lg border border-matrix-border/60 px-6 py-3 text-sm font-semibold text-matrix-text-primary hover:border-matrix-primary"
                            >
                                Continue shopping
                            </Link>

                            <div className="mt-6 border-t border-matrix-border/30 pt-4 text-center text-sm text-matrix-text-secondary">
                                💾 Digital products delivered instantly
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onGuestContinue={() => setShowAuth(false)} />
        </div>
    );
}
