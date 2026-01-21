'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CreditCard, Lock, ArrowLeft, Check } from 'lucide-react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

    useEffect(() => {
        // Redirect to login if not authenticated, then to app checkout
        if (status === 'unauthenticated') {
            router.push('/login?next=/app/checkout');
        } else if (status === 'authenticated') {
            // Redirect to the authenticated checkout in the app
            router.push('/app/checkout');
        }
    }, [status, router]);

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        billingZip: ''
    });

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(cart);
    }, []);

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0; // Digital products, no tax
    const total = subtotal + tax;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clear cart and show success
        localStorage.removeItem('shop_cart');
        setIsProcessing(false);
        setOrderComplete(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
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
                                href="/shop"
                                className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Continue Shopping
                            </Link>
                            <Link
                                href="/"
                                className="block px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Your cart is empty
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Add some products to your cart before checking out
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
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Cart
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Information */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Contact Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Payment Information
                                    </h2>
                                    <Lock className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            required
                                            maxLength={16}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="1234 5678 9012 3456"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Expiry
                                            </label>
                                            <input
                                                type="text"
                                                name="expiry"
                                                value={formData.expiry}
                                                onChange={handleChange}
                                                required
                                                placeholder="MM/YY"
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleChange}
                                                required
                                                maxLength={3}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="123"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                ZIP
                                            </label>
                                            <input
                                                type="text"
                                                name="billingZip"
                                                value={formData.billingZip}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="12345"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-2">
                                    <Lock className="w-3 h-3" />
                                    Your payment information is secure and encrypted
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        Complete Purchase ${total.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {item.name} x{item.quantity}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                                    <span>Tax</span>
                                    <span>${tax.toFixed(2)}</span>
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

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <p>✅ Instant digital delivery</p>
                                <p>✅ Lifetime access</p>
                                <p>✅ Free updates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
