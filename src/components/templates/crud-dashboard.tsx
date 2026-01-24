'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, MoreVertical, X, Menu } from 'lucide-react';

type Item = {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: 'Active' | 'Low Stock' | 'Out of Stock';
};

export default function CRUDDashboard() {
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const [items, setItems] = useState<Item[]>([
        { id: 1, name: 'Product Alpha', category: 'Electronics', price: 299.99, stock: 45, status: 'Active' },
        { id: 2, name: 'Service Beta', category: 'Services', price: 49.99, stock: 999, status: 'Active' },
        { id: 3, name: 'Item Gamma', category: 'Accessories', price: 19.99, stock: 12, status: 'Low Stock' },
        { id: 4, name: 'Product Delta', category: 'Electronics', price: 599.99, stock: 0, status: 'Out of Stock' },
    ]);

    const handleDelete = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleEdit = (item: Item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setShowModal(true);
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden" title="Close sidebar">
                            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                    <nav className="p-4 space-y-1">
                        {[
                            { label: 'Dashboard', active: false },
                            { label: 'Products', active: true },
                            { label: 'Orders', active: false },
                            { label: 'Customers', active: false },
                            { label: 'Analytics', active: false },
                            { label: 'Settings', active: false },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href="#"
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <div className={`transition-all ${sidebarOpen ? 'lg:pl-64' : ''}`}>
                    {/* Header */}
                    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden" title="Toggle sidebar">
                                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products Management</h2>
                            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                                {darkMode ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="p-4 sm:p-6 lg:p-8">
                        {/* Actions Bar */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex-1 w-full sm:max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="search"
                                            placeholder="Search products..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors">
                                        <Filter className="w-5 h-5" />
                                        Filter
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Product
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <input type="checkbox" aria-label="Select all items" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input type="checkbox" aria-label={`Select ${item.name}`} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    #{item.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                    {item.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                    ${item.price.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                    {item.stock}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                        item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors" title="More options">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing 1 to {items.length} of {items.length} results
                                </p>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" disabled>
                                        Previous
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                                        1
                                    </button>
                                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        2
                                    </button>
                                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {selectedItem ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Close modal">
                                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        defaultValue={selectedItem?.name}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter product name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                    <select
                                        defaultValue={selectedItem?.category}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                    >
                                        <option>Electronics</option>
                                        <option>Services</option>
                                        <option>Accessories</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                                        <input
                                            type="number"
                                            defaultValue={selectedItem?.price}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock</label>
                                        <input
                                            type="number"
                                            defaultValue={selectedItem?.stock}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {selectedItem ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
