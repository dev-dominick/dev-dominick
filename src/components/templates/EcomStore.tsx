'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ShoppingCart } from 'lucide-react';

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    image?: string;
    features?: string[];
    techStack?: string[];
    stripeProductId?: string;
    stripePriceId?: string;
}

interface EcomStoreProps {
    products: Product[];
    categories?: string[];
    onAddToCart?: (product: Product) => void;
    cartItemCount?: number;
    showSearch?: boolean;
    showFilters?: boolean;
    gridCols?: 2 | 3 | 4;
    className?: string;
}

export default function EcomStore({
    products,
    categories = ['All'],
    onAddToCart,
    cartItemCount = 0,
    showSearch = true,
    showFilters = true,
    gridCols = 3,
    className = ''
}: EcomStoreProps) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' ||
            product.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const gridColsClass = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4'
    }[gridCols];

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {(showSearch || showFilters) && (
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                        {/* Search */}
                        {showSearch && (
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
                        )}

                        {/* Category Filter */}
                        {showFilters && categories.length > 1 && (
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
                        )}
                    </div>
                )}

                {/* Products Grid */}
                <div className={`grid grid-cols-1 ${gridColsClass} gap-6 mb-12`}>
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
                                    <span className="px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded-full capitalize">
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
                                    {onAddToCart ? (
                                        <button
                                            onClick={() => onAddToCart(product)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Add to Cart
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/shop/${product.id}`}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            View Details
                                        </Link>
                                    )}
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

export { EcomStore };
