'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

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

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-16 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start shopping to add items to your cart
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Browse Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                                <div className="flex gap-4">
                                    {/* Product Icon */}
                                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white">
                                            {item.name.charAt(0)}
                                        </span>
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {item.type}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove from cart"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                                    <span>Tax</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            Total
                                        </span>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </Link>

                            <Link
                                href="/shop"
                                className="w-full block text-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Continue Shopping
                            </Link>

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    💾 Digital products delivered instantly
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
