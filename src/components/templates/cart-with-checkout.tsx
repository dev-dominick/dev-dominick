'use client';

import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, Lock, Check } from 'lucide-react';
import Link from 'next/link';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type?: string;
    stripePriceId?: string;
}

interface CartWithCheckoutProps {
    items: CartItem[];
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
    onCheckout?: (items: CartItem[], total: number) => Promise<void>;
    shopUrl?: string;
    taxRate?: number;
    className?: string;
}

export default function CartWithCheckout({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    shopUrl = '/shop',
    taxRate = 0,
    className = ''
}: CartWithCheckoutProps) {
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        billingZip: ''
    });

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (onCheckout) {
                await onCheckout(items, total);
            }
            setCheckoutStep('success');
        } catch (error) {
            console.error('Checkout failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Success State
    if (checkoutStep === 'success') {
        return (
            <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 ${className}`}>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Order Complete! 🎉
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                            Your digital products are ready to download. Check your email for download links.
                        </p>
                        <div className="space-y-3">
                            <Link
                                href={shopUrl}
                                className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty Cart
    if (items.length === 0 && checkoutStep === 'cart') {
        return (
            <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 ${className}`}>
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
                            href={shopUrl}
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Browse Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Checkout Step
    if (checkoutStep === 'checkout') {
        return (
            <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 ${className}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <button
                        onClick={() => setCheckoutStep('cart')}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
                    >
                        ← Back to Cart
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Checkout
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                                {/* Contact Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Contact Information
                                    </h2>
                                    <div className="space-y-4">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="Email"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Full Name"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CreditCard className="w-5 h-5" />
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Payment Information
                                        </h2>
                                        <Lock className="w-4 h-4 text-green-600 ml-auto" />
                                    </div>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            required
                                            placeholder="Card Number"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <div className="grid grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                name="expiry"
                                                placeholder="MM/YY"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                            />
                                            <input
                                                type="text"
                                                name="cvv"
                                                placeholder="CVV"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                            />
                                            <input
                                                type="text"
                                                name="billingZip"
                                                placeholder="ZIP"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing...' : `Complete Purchase $${total.toFixed(2)}`}
                                </button>
                            </form>
                        </div>

                        {/* Order Summary Sidebar */}
                        <OrderSummary items={items} subtotal={subtotal} tax={tax} total={total} />
                    </div>
                </div>
            </div>
        );
    }

    // Cart View
    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <CartItemCard
                                key={item.id}
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemove={onRemoveItem}
                            />
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Order Summary
                            </h2>
                            <OrderSummary items={items} subtotal={subtotal} tax={tax} total={total} />
                            <button
                                onClick={() => setCheckoutStep('checkout')}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <Link
                                href={shopUrl}
                                className="w-full block text-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: {
    item: CartItem;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{item.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {item.name}
                            </h3>
                            {item.type && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{item.type}</p>
                            )}
                        </div>
                        <button
                            onClick={() => onRemove(item.id)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Remove from cart"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                disabled={item.quantity <= 1}
                                title="Decrease quantity"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                title="Increase quantity"
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
    );
}

function OrderSummary({ items, subtotal, tax, total }: {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
}) {
    return (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
            <div className="border-t pt-3 space-y-3">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                    <div className="flex justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { CartWithCheckout };
