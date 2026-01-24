"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthModal } from "@/components/shop/auth-modal";
import { Button, Container, Section, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { catalogProducts, listCategories } from "@/lib/catalog";
import { useRouter } from "next/navigation";
import { SIMPLE_CONSULTING_MODE } from "@/lib/config/flags";

const categories = ["All", ...listCategories().map((category) => category.charAt(0).toUpperCase() + category.slice(1))];

export default function ShopPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAuth, setShowAuth] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        if (SIMPLE_CONSULTING_MODE) {
            router.replace('/');
        }
    }, [router]);

    if (SIMPLE_CONSULTING_MODE) {
        return (
            <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center px-4">
                <div className="max-w-2xl text-center space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
                        Consulting Focus
                    </div>
                    <h1 className="text-4xl font-bold">We&apos;re focused on consulting right now</h1>
                    <p className="text-neutral-300">
                        Shop templates are paused while we prioritize 1:1 consulting. Book a discovery call to get a tailored execution plan.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/bookings?type=free"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600 transition-colors"
                        >
                            Book a call
                            <Icon name="ArrowRight" size="sm" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 px-6 py-3 font-semibold text-neutral-200 hover:bg-neutral-900 transition-colors"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const currency = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem("shop_cart") || "[]");
        const count = (cart as any[]).reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(count);
    }, []);

    const handleBookConsultation = () => {
        window.location.href = '/bookings?type=free';
    };

    const filteredProducts = useMemo(
        () =>
            catalogProducts.filter((product) => {
                const matchesCategory =
                    selectedCategory === "All" || product.category.toLowerCase() === selectedCategory.toLowerCase();
                const matchesSearch =
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            }),
        [selectedCategory, searchQuery]
    );

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-50">
            <Section className="relative overflow-hidden pb-12 pt-20 md:py-28">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-500/5 via-transparent to-sky-500/10" />
                <Container>
                    <div className="flex flex-col gap-8 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
                                <Icon name="Sparkles" size="sm" /> New for founders
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-neutral-800/60 border border-neutral-700/50 text-neutral-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
                                <Icon name="Shield" size="sm" /> Secure Stripe checkout
                            </span>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl text-neutral-50">
                                Ship faster with vetted website & commerce kits
                            </h1>
                            <p className="mx-auto max-w-3xl text-lg text-neutral-600 dark:text-neutral-400">
                                Choose a proven starter, pay once, and deploy. Need custom? Book a consult and we’ll tailor it to your stack and revenue goals.
                            </p>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                            <Button asChild size="md" variant="primary">
                                <Link href="/cart" className="inline-flex items-center gap-2">
                                    <Icon name="ShoppingCart" size="sm" /> View cart
                                    {cartCount > 0 && <Badge className="ml-1">{cartCount}</Badge>}
                                </Link>
                            </Button>
                            <Button
                                onClick={handleBookConsultation}
                                variant="secondary"
                                size="md"
                            >
                                Book a free consultation
                            </Button>
                            <Link href="/contact" className="text-sm text-neutral-600 hover:text-sky-600 dark:text-neutral-400 dark:hover:text-sky-400">
                                Questions? Contact us
                            </Link>
                        </div>

                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            Prefer full-service builds? See <Link href="/pricing" className="text-sky-600 dark:text-sky-400 hover:underline">service pricing</Link> (from $2,500).
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-3 py-2">
                                <Icon name="Sparkles" size="sm" color="warning" /> Launch in days, not months
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-3 py-2">
                                <Icon name="Shield" size="sm" color="primary" /> Enterprise-ready security
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-3 py-2">
                                <span className="font-mono text-neutral-900 dark:text-neutral-100">500+ deployments</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>

            <Section className="py-8 border-b border-neutral-200 dark:border-neutral-800">
                <Container className="space-y-6">
                    <div className="flex flex-col items-start gap-4">
                        <div className="relative w-full md:w-96">
                            <Icon name="Search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="Search products"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-900 pl-10"
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Icon name="Filter" size="sm" className="text-neutral-500 dark:text-neutral-400" />
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-lg px-4 py-2 text-sm transition-colors border ${
                                    selectedCategory === category
                                        ? "border-sky-500/60 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200"
                                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </Container>
            </Section>

            <Section className="pb-20">
                <Container>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="relative overflow-hidden border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-lg transition-all duration-300"
                            >
                                <CardContent className="space-y-4 pt-6">
                                    <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold capitalize">
                                            {product.category}
                                        </span>
                                        <span className="rounded-full border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                                            {currency.format(product.price)}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <CardTitle className="text-xl dark:text-neutral-50">{product.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 dark:text-neutral-400">{product.description}</CardDescription>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                                        {product.features.slice(0, 3).map((feat) => (
                                            <span key={feat} className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2 py-1">{feat}</span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                            <Icon name="Sparkles" size="sm" color="warning" />
                                            <span>{product.reviews} reviews</span>
                                        </div>
                                        <Link href={`/shop/${product.id}`}>
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-16 text-center text-neutral-600 dark:text-neutral-400">
                            <p className="text-lg">No products match that search.</p>
                        </div>
                    )}
                </Container>
            </Section>

            <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onGuestContinue={() => setShowAuth(false)} />
        </main>
    );
}
