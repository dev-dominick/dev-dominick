'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Filter } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;
    inStock: boolean;
}

const products: Product[] = [
    {
        id: '1',
        name: 'Premium React Components Pack',
        price: 49.99,
        description: '50+ production-ready React components with TypeScript',
        category: 'components',
        image: '/placeholder-component.jpg',
        inStock: true
    },
    {
        id: '2',
        name: 'Next.js Dashboard Template',
        price: 79.99,
        description: 'Complete admin dashboard with analytics and dark mode',
        category: 'templates',
        image: '/placeholder-dashboard.jpg',
        inStock: true
    },
    {
        id: '3',
        name: 'E-commerce Starter Kit',
        price: 129.99,
        description: 'Full-stack e-commerce solution with Stripe integration',
        category: 'templates',
        image: '/placeholder-ecommerce.jpg',
        inStock: true
    },
    {
        id: '4',
        name: 'UI Component Library',
        price: 39.99,
        description: 'Comprehensive UI library with Tailwind CSS',
        category: 'components',
        image: '/placeholder-ui.jpg',
        inStock: true
    },
    {
        id: '5',
        name: 'SaaS Landing Page',
        price: 59.99,
        description: 'Convert-optimized landing page for SaaS products',
        category: 'templates',
        image: '/placeholder-saas.jpg',
        inStock: true
    },
    {
        id: '6',
        name: 'Blog Template Pro',
        price: 44.99,
        description: 'Modern blog template with MDX support',
        category: 'templates',
        image: '/placeholder-blog.jpg',
        inStock: true
    }
];

const categories = ['All', 'Components', 'Templates'];

export default function ShopPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' ||
            product.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                            Code Cloud
                        </Link>
                        <Link
                            href="/cart"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="font-medium">Cart</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Premium Development Resources
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Production-ready templates and components to accelerate your development
                    </p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
                        >
                            {/* Product Image */}
                            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-6xl font-bold text-white opacity-20">
                                        {product.name.charAt(0)}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded-full">
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${product.price}
                                    </span>
                                    <Link
                                        href={`/shop/${product.id}`}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            No products found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
