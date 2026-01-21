'use client';

import { useState } from 'react';
import { Calendar, Clock, Search, Tag, User, ArrowRight } from 'lucide-react';

export default function Blog() {
    const [darkMode, setDarkMode] = useState(false);

    const posts = [
        {
            id: 1,
            title: 'Getting Started with Modern Web Development',
            excerpt: 'Learn the fundamentals of building modern web applications with the latest technologies and best practices.',
            author: 'Jane Cooper',
            date: '2024-01-14',
            readTime: '5 min read',
            category: 'Development',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
        },
        {
            id: 2,
            title: 'The Future of AI in Software Engineering',
            excerpt: 'Exploring how artificial intelligence is revolutionizing the way we build and maintain software systems.',
            author: 'John Smith',
            date: '2024-01-12',
            readTime: '8 min read',
            category: 'AI',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
        },
        {
            id: 3,
            title: 'Best Practices for API Design',
            excerpt: 'A comprehensive guide to designing robust, scalable, and developer-friendly APIs.',
            author: 'Sarah Johnson',
            date: '2024-01-10',
            readTime: '6 min read',
            category: 'Backend',
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
        },
    ];

    const categories = ['All', 'Development', 'AI', 'Backend', 'Frontend', 'DevOps'];

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-white dark:bg-gray-900">
                {/* Header */}
                <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <a href="#" className="text-2xl font-bold text-gray-900 dark:text-white">
                                DevBlog
                            </a>
                            <div className="hidden md:flex items-center gap-6">
                                {['Home', 'Articles', 'About', 'Contact'].map((item) => (
                                    <a key={item} href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {item}
                                    </a>
                                ))}
                            </div>
                            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                {darkMode ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </nav>
                </header>

                {/* Hero */}
                <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-5xl font-bold mb-6">Insights & Stories</h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Exploring the latest trends in technology, development, and innovation
                        </p>
                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search articles..."
                                className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex gap-4 overflow-x-auto py-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${cat === 'All'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Post */}
                <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="aspect-video lg:aspect-auto bg-gray-200 dark:bg-gray-700">
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-700"></div>
                                </div>
                                <div className="p-8 flex flex-col justify-center">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                                            Featured
                                        </span>
                                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            Jan 14, 2024
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                        Building Scalable Applications with Modern Architecture
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Discover the key principles and patterns for creating applications that can handle millions of users while maintaining performance and reliability.
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                JD
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">John Doe</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Senior Engineer</p>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                                            Read More <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blog Posts Grid */}
                <section className="py-16 bg-white dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Latest Articles</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <article key={post.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group">
                                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-700 group-hover:scale-105 transition-transform"></div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-semibold">
                                                {post.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                <Clock className="w-4 h-4" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{post.author}</span>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-500">{post.date}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-16 bg-gray-50 dark:bg-gray-800">
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Subscribe to our newsletter</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Get the latest articles and insights delivered to your inbox weekly</p>
                        <form className="flex gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                            />
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-400 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <h3 className="text-white font-bold mb-4">DevBlog</h3>
                                <p className="text-sm">Sharing knowledge and insights about modern software development.</p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-4">Categories</h3>
                                <ul className="space-y-2 text-sm">
                                    {categories.slice(1).map((cat) => (
                                        <li key={cat}><a href="#" className="hover:text-white transition-colors">{cat}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-4">Company</h3>
                                <ul className="space-y-2 text-sm">
                                    {['About', 'Team', 'Careers', 'Contact'].map((item) => (
                                        <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-4">Legal</h3>
                                <ul className="space-y-2 text-sm">
                                    {['Privacy', 'Terms', 'Cookies'].map((item) => (
                                        <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8 text-center text-sm">
                            <p>&copy; 2026 DevBlog. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
