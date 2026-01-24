'use client';

import { useState } from 'react';
import { Check, X, Star, Menu, ChevronRight, Zap, Shield, TrendingUp } from 'lucide-react';

export default function MarketingPage() {
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    const features = [
        { icon: Zap, title: 'Lightning Fast', description: 'Optimized performance for the best user experience' },
        { icon: Shield, title: 'Secure by Default', description: 'Enterprise-grade security built into every layer' },
        { icon: TrendingUp, title: 'Scale with Ease', description: 'Grow from startup to enterprise seamlessly' },
    ];

    const plans = [
        { name: 'Starter', price: { monthly: 9, yearly: 90 }, features: ['5 Projects', '10GB Storage', 'Basic Support'] },
        { name: 'Pro', price: { monthly: 29, yearly: 290 }, features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics'], popular: true },
        { name: 'Enterprise', price: { monthly: 99, yearly: 990 }, features: ['Everything in Pro', 'Dedicated Support', 'Custom Integrations', 'SLA'] },
    ];

    const testimonials = [
        { name: 'Sarah Johnson', role: 'CEO at TechCorp', quote: 'This product completely transformed how we work. Highly recommended!', rating: 5 },
        { name: 'Michael Chen', role: 'CTO at StartupXYZ', quote: 'The best investment we made this year. ROI was immediate.', rating: 5 },
        { name: 'Emily Davis', role: 'Product Manager', quote: 'Intuitive, powerful, and exactly what we needed.', rating: 5 },
    ];

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-white dark:bg-gray-900">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-8">
                                <a href="#" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    BrandName
                                </a>
                                <div className="hidden md:flex gap-6">
                                    {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
                                        <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            {item}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                    {darkMode ? '☀️' : '🌙'}
                                </button>
                                <button className="hidden md:block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                                    Sign in
                                </button>
                                <button className="hidden md:block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                    Get Started
                                </button>
                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                                    {mobileMenuOpen ? <X /> : <Menu />}
                                </button>
                            </div>
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                                    Build Better.<br />
                                    Ship Faster.
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                                    The all-in-one platform that helps teams collaborate, create, and launch products faster than ever before.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                                        Start Free Trial <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all">
                                        Watch Demo
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                                    ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
                                </p>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl shadow-2xl"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-white dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need</h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400">Powerful features to help you succeed</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature) => (
                                <div key={feature.title} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Choose the plan that's right for you</p>
                            <div className="inline-flex bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                                <button
                                    onClick={() => setSelectedPlan('monthly')}
                                    className={`px-6 py-2 rounded-md font-medium transition-colors ${selectedPlan === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setSelectedPlan('yearly')}
                                    className={`px-6 py-2 rounded-md font-medium transition-colors ${selectedPlan === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    Yearly <span className="text-green-600 text-sm ml-1">(Save 20%)</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`relative bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-blue-600' : ''
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                    <div className="mb-6">
                                        <span className="text-5xl font-bold text-gray-900 dark:text-white">
                                            ${plan.price[selectedPlan as keyof typeof plan.price]}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">/{selectedPlan === 'monthly' ? 'mo' : 'yr'}</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                                <Check className="w-5 h-5 text-green-600" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.popular
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                                : 'border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        Get Started
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-white dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Loved by thousands</h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400">See what our customers have to say</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial) => (
                                <div key={testimonial.name} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">"{testimonial.quote}"</p>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
                        <p className="text-xl text-blue-100 mb-8">Join thousands of teams already using our platform</p>
                        <button className="px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all">
                            Start Your Free Trial
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-400 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-white font-bold mb-4">Product</h3>
                                <ul className="space-y-2">
                                    {['Features', 'Pricing', 'Security', 'Roadmap'].map((item) => (
                                        <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-4">Company</h3>
                                <ul className="space-y-2">
                                    {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                                        <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-4">Resources</h3>
                                <ul className="space-y-2">
                                    {['Documentation', 'Help Center', 'API', 'Community'].map((item) => (
                                        <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-4">Legal</h3>
                                <ul className="space-y-2">
                                    {['Privacy', 'Terms', 'Security', 'Cookies'].map((item) => (
                                        <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                            <p>&copy; 2026 BrandName. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
