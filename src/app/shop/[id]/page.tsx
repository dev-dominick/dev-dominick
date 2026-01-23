"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Check, Download, Star, Shield } from "lucide-react";

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
            <div className="min-h-screen bg-matrix-black flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-matrix-text-primary mb-4">Product Not Found</h1>
                    <Link href="/shop" className="text-matrix-primary hover:text-matrix-secondary font-mono">
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
                        href="/shop"
                        className="flex items-center gap-2 text-matrix-text-secondary hover:text-matrix-primary"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-mono">Back to shop</span>
                    </Link>
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 rounded-lg bg-matrix-primary px-4 py-2 text-sm font-semibold text-matrix-black shadow-matrix hover:bg-matrix-secondary"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Cart
                    </Link>
                </div>
            </header>

            {/* Product Details */}
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* Product Image */}
                    <div className="relative overflow-hidden rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-6 shadow-matrix">
                        <div className="absolute inset-0 opacity-20" aria-hidden>
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle at 20% 20%, #00ff4122, transparent 25%), radial-gradient(circle at 80% 0%, #39ff1422, transparent 30%)",
                                }}
                            />
                        </div>
                        <div className="relative flex h-80 items-center justify-center">
                            <span className="text-8xl font-black text-matrix-primary/40">
                                {product.name.charAt(0)}
                            </span>
                        </div>
                        <div className="relative mt-4 flex items-center gap-4 rounded-lg border border-matrix-border/40 bg-matrix-black/60 px-4 py-3 text-sm text-matrix-text-secondary">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="font-semibold text-matrix-text-primary">{product.rating}</span>
                            </div>
                            <span>{product.reviews} reviews</span>
                            <div className="ml-auto flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                <span className="font-mono">{product.downloads.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="rounded-full border border-matrix-border/50 bg-matrix-black/60 px-3 py-1 text-xs font-mono uppercase tracking-wide text-matrix-text-secondary">
                                {product.category}
                            </span>
                            <div className="flex items-center gap-2 text-sm text-matrix-text-secondary">
                                <Shield className="h-4 w-4 text-matrix-primary" />
                                Secure Stripe checkout
                            </div>
                        </div>

                        <div>
                            <h1 className="mb-3 text-4xl font-bold text-matrix-text-primary">{product.name}</h1>
                            <p className="text-lg text-matrix-text-secondary">{product.description}</p>
                        </div>

                        <div className="text-4xl font-bold text-matrix-text-primary">${product.price}</div>

                        {/* Features */}
                        <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-5">
                            <h3 className="mb-4 text-lg font-semibold text-matrix-text-primary">What&apos;s included</h3>
                            <ul className="space-y-3">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="mt-0.5 h-5 w-5 text-matrix-primary flex-shrink-0" />
                                        <span className="text-matrix-text-secondary">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tech Stack */}
                        <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-5">
                            <h3 className="mb-3 text-lg font-semibold text-matrix-text-primary">Tech stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.techStack.map((tech, idx) => (
                                    <span
                                        key={idx}
                                        className="rounded-lg border border-matrix-border/40 bg-matrix-black/60 px-3 py-1 text-sm text-matrix-text-secondary"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-matrix-primary px-8 py-4 text-lg font-semibold text-matrix-black shadow-matrix hover:bg-matrix-secondary"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            Add to cart
                        </button>

                        {/* Details */}
                        <div className="rounded-2xl border border-matrix-border/40 bg-matrix-darker/80 p-5">
                            <h3 className="mb-3 text-lg font-semibold text-matrix-text-primary">Description</h3>
                            <p className="text-matrix-text-secondary leading-relaxed">{product.longDescription}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
