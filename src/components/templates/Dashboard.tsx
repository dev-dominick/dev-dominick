'use client';


import { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Menu, X, Search, Bell, Settings, ChevronDown } from 'lucide-react';

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const stats = [
        { title: 'Total Revenue', value: '$48,574', change: '+12.5%', icon: DollarSign, trend: 'up' },
        { title: 'New Users', value: '2,845', change: '+8.2%', icon: Users, trend: 'up' },
        { title: 'Sales', value: '1,426', change: '-3.1%', icon: TrendingUp, trend: 'down' },
        { title: 'Performance', value: '92.3%', change: '+2.4%', icon: BarChart3, trend: 'up' },
    ];

    const recentOrders = [
        { id: '#5331', customer: 'Jenny Wilson', date: '2024-01-14', amount: '$142.50', status: 'Delivered' },
        { id: '#5330', customer: 'Devon Lane', date: '2024-01-13', amount: '$98.00', status: 'Processing' },
        { id: '#5329', customer: 'Jacob Jones', date: '2024-01-13', amount: '$256.80', status: 'Delivered' },
        { id: '#5328', customer: 'Kristin Watson', date: '2024-01-12', amount: '$45.20', status: 'Cancelled' },
    ];

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden" title="Close sidebar">
                            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    <nav className="p-4 space-y-1">
                        {['Overview', 'Analytics', 'Reports', 'Customers', 'Products', 'Settings'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${item === 'Overview'
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {item}
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

                            <div className="flex-1 max-w-xl px-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="search"
                                        placeholder="Search..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                                    {darkMode ? '☀️' : '🌙'}
                                </button>
                                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Notifications">
                                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="User menu">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        JD
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Content */}
                    <main className="p-4 sm:p-6 lg:p-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat) => (
                                <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Revenue Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
                                <div className="h-64 flex items-end justify-around gap-2">
                                    {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                                        <div key={i} className="flex-1 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600" style={{ height: `${height}%` }}></div>
                                    ))}
                                </div>
                                <div className="flex justify-around mt-2 text-xs text-gray-600 dark:text-gray-400">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
                                </div>
                            </div>

                            {/* Traffic Sources */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h3>
                                <div className="space-y-4">
                                    {[
                                        { source: 'Organic Search', value: 45, color: 'bg-blue-500' },
                                        { source: 'Direct', value: 30, color: 'bg-green-500' },
                                        { source: 'Social Media', value: 15, color: 'bg-purple-500' },
                                        { source: 'Referral', value: 10, color: 'bg-orange-500' },
                                    ].map((item) => (
                                        <div key={item.source}>
                                            <div className="flex justify-between mb-1 text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">{item.source}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{item.value}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{order.customer}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{order.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{order.amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
