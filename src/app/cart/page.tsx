"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, UserPlus } from "lucide-react";
import { AuthModal } from "@/components/shop/auth-modal";
import { getProductById } from "@/lib/catalog";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: string;
    stripePriceId?: string;
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const currency = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        const normalized: CartItem[] = (cart as CartItem[]).map((item) => {
            const catalogProduct = getProductById(item.id);
            return {
                ...item,
                stripePriceId: item.stripePriceId || catalogProduct?.stripePriceId,
            };
        }).filter((item) => item.stripePriceId);

        setItems(normalized);
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
                    <div className="rounded-2xl border border-matrix-border/60 bg-matrix-darker p-14 text-center shadow-matrix">
                        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-matrix-text-muted" />
                        <h2 className="mb-2 text-2xl font-bold text-matrix-text-primary">Your cart is empty</h2>
                        <p className="mb-6 text-matrix-text-secondary">Start shopping to add items.</p>
                        <Link
                            href="/shop"
                            className="inline-block rounded-lg bg-matrix-primary px-6 py-3 font-semibold text-matrix-black hover:brightness-110 shadow-matrix"
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
            <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cart ({itemCount} {itemCount === 1 ? "item" : "items"})</h1>
                        <p className="text-matrix-text-secondary">You're booking a paid consultation. Need custom work? <Link href="/contact" className="text-matrix-primary hover:brightness-110">Contact us</Link>.</p>
                    </div>
                    <button
                        onClick={() => setShowAuth(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-matrix-border/60 px-4 py-2 text-sm text-matrix-text-secondary hover:border-matrix-primary hover:text-matrix-text-primary"
                    >
                        <UserPlus className="h-4 w-4" />
                        Sign in / up
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {items.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-matrix-border/60 bg-matrix-darker p-6 shadow-matrix">
                                <div className="flex gap-4">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-matrix-border/60 bg-matrix-dark text-2xl font-bold text-matrix-text-muted">
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
                                                className="rounded-lg p-2 text-red-400 hover:bg-matrix-dark"
                                                title="Remove from cart"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="rounded-lg border border-matrix-border/60 p-2 hover:border-matrix-primary disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="rounded-lg border border-matrix-border/60 p-2 hover:border-matrix-primary"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-matrix-text-primary">
                                                    {currency.format(item.price * item.quantity)}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-sm text-matrix-text-secondary">
                                                        {currency.format(item.price)} each
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-matrix-border/60 bg-matrix-darker p-6 shadow-matrix">
                            <h2 className="mb-6 text-xl font-bold">Order summary</h2>

                            <div className="mb-6 space-y-3 text-matrix-text-secondary">
                                <div className="flex items-center justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-matrix-text-primary">{currency.format(total)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Tax</span>
                                    <span>{currency.format(0)}</span>
                                </div>
                                <div className="border-t border-matrix-border/40 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-matrix-text-primary">Total</span>
                                        <span className="text-2xl font-bold text-matrix-text-primary">{currency.format(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-matrix-primary px-6 py-3 font-semibold text-matrix-black shadow-matrix hover:brightness-110"
                            >
                                Proceed to checkout
                                <ArrowRight className="h-5 w-5" />
                            </Link>

                            <div className="text-center text-sm text-matrix-text-secondary space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    <span>Questions before booking? </span>
                                    <Link href="/contact" className="text-matrix-primary hover:brightness-110">Contact us</Link>
                                </div>
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center justify-center rounded-lg border border-matrix-border/60 px-6 py-2 text-sm font-semibold text-matrix-text-primary hover:border-matrix-primary"
                                >
                                    Continue shopping
                                </Link>
                            </div>

                            <div className="mt-6 border-t border-matrix-border/40 pt-4 text-center text-sm text-matrix-text-secondary">
                                Instant delivery. Free deployment support. Business-grade quality.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onGuestContinue={() => setShowAuth(false)} />
        </div>
    );
}
