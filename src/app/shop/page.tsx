"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Filter, Shield, Sparkles } from "lucide-react";
import { AuthModal } from "@/components/shop/AuthModal";

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    stripePriceId: string;
}

const products: Product[] = [
    {
        id: "1",
        name: "Premium React Components Pack",
        price: 49.99,
        description: "50+ production-ready React components with TypeScript",
        category: "components",
        stripePriceId: process.env.NEXT_PUBLIC_PRICE_COMPONENTS || "price_placeholder_components",
    },
    {
        id: "2",
        name: "Next.js Dashboard Template",
        price: 79.99,
        description: "Complete admin dashboard with analytics and dark mode",
        category: "templates",
        stripePriceId: process.env.NEXT_PUBLIC_PRICE_DASHBOARD || "price_placeholder_dashboard",
    },
    {
        id: "3",
        name: "E-commerce Starter Kit",
        price: 129.99,
        description: "Full-stack e-commerce solution with Stripe integration",
        category: "templates",
        stripePriceId: process.env.NEXT_PUBLIC_PRICE_ECOMMERCE || "price_placeholder_ecommerce",
    },
    {
        id: "4",
        name: "UI Component Library",
        price: 39.99,
        description: "Comprehensive UI library with Tailwind CSS",
        category: "components",
        stripePriceId: process.env.NEXT_PUBLIC_PRICE_UI_LIBRARY || "price_placeholder_ui",
    },
    {
        id: "5",
        name: "SaaS Landing Page",
        price: 59.99,
        description: "Convert-optimized landing page for SaaS products",
        category: "templates",
        stripePriceId: process.env.NEXT_PUBLIC_PRICE_SAAS_LANDING || "price_placeholder_saas",
    },
    {
        id: "6",
        name: "Blog Template Pro",
        price: 44.99,
        description: "Modern blog template with MDX support",
        category: "templates",
        stripePriceId: process.env.NEXT_PUBLIC_PRICE_BLOG_TEMPLATE || "price_placeholder_blog",
    },
];

const categories = ["All", "Components", "Templates"];

export default function ShopPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAuth, setShowAuth] = useState(false);

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            selectedCategory === "All" || product.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-matrix-black text-matrix-text-primary">
            <div className="fixed inset-0 pointer-events-none opacity-[0.07]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-matrix-border/30 bg-matrix-dark/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-mono text-lg font-bold text-matrix-text-primary hover:text-matrix-primary"
                    >
                        <span>dev-dominick</span>
                        <span className="text-matrix-primary">/</span>
                        <span className="text-matrix-text-secondary">shop</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAuth(true)}
                            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-matrix-border/50 px-4 py-2 text-sm font-mono text-matrix-text-secondary hover:border-matrix-primary hover:text-matrix-primary"
                        >
                            Sign in / up
                        </button>
                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-2 rounded-lg bg-matrix-primary px-4 py-2 text-sm font-semibold text-matrix-black shadow-matrix hover:bg-matrix-secondary"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Cart
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative z-10 px-4 pb-10 pt-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl text-center">
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-matrix-border/50 bg-matrix-darker/80 px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] text-matrix-primary">
                        Matrix-grade launch kits
                    </p>
                    <h1 className="mb-4 text-4xl font-bold leading-tight text-matrix-text-primary sm:text-5xl lg:text-6xl font-mono">
                        Ship faster with ready-to-deploy products
                    </h1>
                    <p className="mx-auto mb-8 max-w-3xl text-lg text-matrix-text-secondary">
                        Templates, components, and starter kits wired for Stripe so you can go live in hours—not weeks. Secure, performant, and fully typed.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                        <Link href="/cart" className="w-full sm:w-auto">
                            <button className="w-full rounded-lg bg-matrix-primary px-6 py-3 font-semibold text-matrix-black hover:bg-matrix-secondary shadow-matrix">
                                View cart
                            </button>
                        </Link>
                        <button
                            onClick={() => setShowAuth(true)}
                            className="w-full sm:w-auto rounded-lg border border-matrix-border/60 px-6 py-3 font-semibold text-matrix-text-primary hover:border-matrix-primary hover:text-matrix-primary"
                        >
                            Sign in to save
                        </button>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-6 text-sm text-matrix-text-secondary">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-matrix-primary" />
                            Secure Stripe checkout
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-matrix-secondary" />
                            Instant digital delivery
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="relative z-10 px-4 pb-6 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-matrix-text-muted" />
                        <input
                            type="text"
                            placeholder="Search products"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-matrix-border/50 bg-matrix-darker px-10 py-3 text-matrix-text-primary placeholder:text-matrix-text-muted focus:border-matrix-primary focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-matrix-text-muted" />
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-lg px-4 py-2 text-sm font-mono transition-colors ${
                                    selectedCategory === category
                                        ? "border border-matrix-primary/60 bg-matrix-primary/10 text-matrix-primary"
                                        : "border border-matrix-border/50 bg-matrix-darker text-matrix-text-secondary hover:border-matrix-primary/40 hover:text-matrix-primary"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product grid */}
            <section className="relative z-10 px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group relative overflow-hidden rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-matrix-primary/60 hover:shadow-matrix"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="rounded-full border border-matrix-border/60 bg-matrix-black/60 px-3 py-1 text-xs font-mono uppercase tracking-wide text-matrix-text-secondary">
                                        {product.category}
                                    </span>
                                    <Sparkles className="h-4 w-4 text-matrix-secondary opacity-70" />
                                </div>

                                <h3 className="mb-2 text-xl font-semibold text-matrix-text-primary">{product.name}</h3>
                                <p className="mb-4 line-clamp-3 text-sm text-matrix-text-secondary">{product.description}</p>

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-matrix-text-primary">${product.price}</span>
                                    <Link
                                        href={`/shop/${product.id}`}
                                        className="rounded-lg border border-matrix-border/60 px-4 py-2 text-sm font-semibold text-matrix-text-primary hover:border-matrix-primary hover:text-matrix-primary"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-16 text-center text-matrix-text-secondary">
                            <p className="text-lg">No products match that search.</p>
                        </div>
                    )}
                </div>
            </section>

            <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onGuestContinue={() => setShowAuth(false)} />
        </div>
    );
}
