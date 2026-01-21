'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Check, Download, Star } from 'lucide-react';

// Mock product data (in production, fetch from API)
const products = {
    '1': {
        id: '1',
        name: 'Premium React Components Pack',
        price: 49.99,
        description: '50+ production-ready React components built with TypeScript and Tailwind CSS. Fully customizable and accessible.',
        longDescription: 'This comprehensive component library includes everything you need to build modern web applications. Each component is carefully crafted with best practices, accessibility in mind, and full TypeScript support.',
        category: 'components',
        features: [
            'TypeScript support',
            '50+ customizable components',
            'Dark mode ready',
            'Full accessibility (WCAG 2.1)',
            'Storybook documentation',
            'Unit tests included'
        ],
        techStack: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
        rating: 4.9,
        reviews: 127,
        downloads: 1543
    },
    '2': {
        id: '2',
        name: 'Next.js Dashboard Template',
        price: 79.99,
        description: 'Complete admin dashboard with analytics, charts, and user management.',
        longDescription: 'A production-ready admin dashboard template built with Next.js 14. Includes authentication, role-based access control, analytics dashboards, and more.',
        category: 'templates',
        features: [
            'Next.js 14 App Router',
            'Authentication & authorization',
            'Analytics dashboard',
            'User management',
            'API routes included',
            'Responsive design'
        ],
        techStack: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
        rating: 5.0,
        reviews: 89,
        downloads: 876
    },
    '3': {
        id: '3',
        name: 'E-commerce Starter Kit',
        price: 129.99,
        description: 'Full-stack e-commerce solution with cart, checkout, and payment processing.',
        longDescription: 'Everything you need to launch an online store. Includes product management, shopping cart, secure checkout with Stripe, order management, and customer accounts.',
        category: 'templates',
        features: [
            'Stripe integration',
            'Shopping cart & checkout',
            'Product management',
            'Order tracking',
            'Customer accounts',
            'Email notifications'
        ],
        techStack: ['Next.js', 'Prisma', 'Stripe', 'PostgreSQL', 'NextAuth'],
        rating: 4.8,
        reviews: 156,
        downloads: 2103
    }
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();

    const product = products[params.id as keyof typeof products];

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
                    <Link href="/shop" className="text-blue-600 hover:text-blue-700">
                        ← Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        // In production, use cart context/store
        interface CartItem {
            id: string;
            name: string;
            price: number;
            quantity: number;
            type: string;
        }
        const cart: CartItem[] = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                type: product.category
            });
        }

        localStorage.setItem('shop_cart', JSON.stringify(cart));
        router.push('/cart');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/shop" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Shop</span>
                        </Link>
                        <Link
                            href="/cart"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span>Cart</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Product Details */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="relative h-96 lg:h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-9xl font-bold text-white opacity-20">
                                {product.name.charAt(0)}
                            </span>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                                <div className="flex items-center gap-4 text-white">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-bold">{product.rating}</span>
                                    </div>
                                    <span className="text-sm opacity-90">{product.reviews} reviews</span>
                                    <Download className="w-5 h-5 ml-auto" />
                                    <span className="font-bold">{product.downloads.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium capitalize">
                                {product.category}
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            {product.name}
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                            {product.description}
                        </p>

                        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                            ${product.price}
                        </div>

                        {/* Features */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What&apos;s Included:</h3>
                            <ul className="space-y-3">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tech Stack */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tech Stack:</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.techStack.map((tech, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-bold"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            Add to Cart
                        </button>

                        {/* Details */}
                        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {product.longDescription}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
