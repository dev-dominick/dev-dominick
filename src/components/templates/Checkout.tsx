'use client';

import { useState } from 'react';
import { CreditCard, Check, Lock, ShoppingCart } from 'lucide-react';

export default function Checkout() {
    const [step, setStep] = useState(1);
    const [darkMode, setDarkMode] = useState(false);

    const steps = ['Shipping', 'Payment', 'Review'];

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg z-50"
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>

                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
                        <p className="text-gray-600 dark:text-gray-400">Complete your purchase in a few simple steps</p>
                    </div>

                    {/* Stepper */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center">
                            {steps.map((label, index) => (
                                <div key={label} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${index + 1 < step ? 'bg-green-500 text-white' :
                                                index + 1 === step ? 'bg-blue-600 text-white' :
                                                    'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {index + 1 < step ? <Check className="w-5 h-5" /> : index + 1}
                                        </div>
                                        <span className={`mt-2 text-sm font-medium ${index + 1 === step ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-24 h-1 mx-4 ${index + 1 < step ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shipping Information</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="First name"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Last name"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Address"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="City"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                placeholder="ZIP code"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white">
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>United Kingdom</option>
                                        </select>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Details</h2>
                                        <div className="flex gap-4 mb-6">
                                            {['Card', 'PayPal', 'Apple Pay'].map((method) => (
                                                <button
                                                    key={method}
                                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${method === 'Card'
                                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {method}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Card number"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Cardholder name"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                placeholder="CVV"
                                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <p className="text-sm text-blue-900 dark:text-blue-300">Your payment information is secure and encrypted</p>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Review Order</h2>
                                        <div className="space-y-3">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    John Doe<br />
                                                    123 Main Street<br />
                                                    New York, NY 10001<br />
                                                    United States
                                                </p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Method</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Visa ending in 4242
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(Math.max(1, step - 1))}
                                    disabled={step === 1}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => {
                                        if (step === 3) {
                                            alert('Order placed!');
                                        } else {
                                            setStep(step + 1);
                                        }
                                    }}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                                >
                                    {step === 3 ? 'Place Order' : 'Continue'}
                                </button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                                <div className="space-y-4 mb-6">
                                    {[
                                        { name: 'Premium Plan', price: 99 },
                                        { name: 'Extra Storage (50GB)', price: 19 },
                                    ].map((item) => (
                                        <div key={item.name} className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Qty: 1</p>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white">${item.price}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span>$118.00</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Shipping</span>
                                        <span>$5.00</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Tax</span>
                                        <span>$12.30</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                        <span>Total</span>
                                        <span>$135.30</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
