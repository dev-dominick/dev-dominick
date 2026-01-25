"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Check, Star, Shield, Gauge } from "lucide-react";
import { getProductById, catalogProducts } from "@/lib/catalog";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();

    const product = getProductById(params.id as string);
    const currency = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);

    const handleBookConsultation = () => {
        const consultationProduct = catalogProducts.find(p => p.id === "custom-consultation");
        if (!consultationProduct) return;
        
        const cart = JSON.parse(localStorage.getItem("shop_cart") || "[]");
        const existingItem = cart.find((item: any) => item.id === "custom-consultation");
        
        if (!existingItem) {
            cart.push({
                id: consultationProduct.id,
                name: consultationProduct.name,
                price: consultationProduct.price,
                quantity: 1,
                stripePriceId: consultationProduct.stripePriceId
            });
            localStorage.setItem("shop_cart", JSON.stringify(cart));
        }
        
        window.location.href = "/cart";
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-matrix-black text-matrix-text-primary">
                <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12 pt-16 sm:px-6 lg:px-8">
                    <header className="flex items-center gap-3 text-matrix-text-secondary">
                        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-matrix-text-secondary hover:text-matrix-primary">
                            <ArrowLeft className="h-4 w-4" />
                            Back to shop
                        </Link>
                    </header>
                    <div className="rounded-2xl border border-matrix-border/30 bg-matrix-darker px-6 py-10 text-center">
                        <h1 className="text-2xl font-semibold text-matrix-text-primary">Product not found</h1>
                        <p className="mt-2 text-matrix-text-secondary">This product is unavailable. Try another item.</p>
                        <Link href="/shop" className="mt-6 inline-block">
                            <Button variant="primary">Return to shop</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const handleAddToCart = () => {
        // In production, use cart context/store
        interface CartItem {
            id: string;
            name: string;
            price: number;
            quantity: number;
            type: string;
            stripePriceId: string;
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
                type: product.category,
                stripePriceId: product.stripePriceId
            });
        }

        localStorage.setItem('shop_cart', JSON.stringify(cart));
        router.push('/cart');
    };

    return (
        <div className="min-h-screen bg-matrix-black text-matrix-text-primary relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-matrix-primary/25 blur-3xl" />
                <div className="absolute right-0 top-56 h-72 w-72 rounded-full bg-accent/18 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-matrix-primary/50 to-transparent" />
            </div>
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 text-matrix-text-secondary">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-matrix-text-secondary hover:text-matrix-primary">
                        <ArrowLeft className="h-4 w-4" />
                        Back to shop
                    </Link>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative overflow-hidden rounded-2xl border border-matrix-border/30 bg-matrix-darker/70 px-6 py-10 shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-matrix-primary/12 via-transparent to-accent/10" />
                        <div className="relative flex h-full flex-col gap-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="badge-soft capitalize">{product.category}</span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-matrix-border/40 bg-matrix-dark/80 px-3 py-1 text-sm text-matrix-text-secondary">
                                    <Star className="h-4 w-4 text-accent" />
                                    {product.reviews} reviews
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-matrix-border/40 bg-matrix-dark/80 px-3 py-1 text-sm text-matrix-text-secondary">
                                    <Gauge className="h-4 w-4 text-primary" />
                                    Optimized funnels
                                </span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold text-matrix-text-primary">{product.name}</h1>
                                <p className="max-w-2xl text-lg text-matrix-text-secondary">{product.description}</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-matrix-border/30 bg-matrix-dark px-4 py-3">
                                    <p className="text-sm text-matrix-text-secondary">Price</p>
                                    <p className="text-3xl font-semibold text-matrix-text-primary">{currency.format(product.price)}</p>
                                </div>
                                <div className="rounded-xl border border-matrix-border/30 bg-matrix-dark px-4 py-3">
                                    <p className="text-sm text-matrix-text-secondary">Ship time</p>
                                    <p className="text-base text-matrix-text-primary">Launch-ready in days with install guide.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-matrix-border/30 bg-matrix-darker p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm text-matrix-text-secondary">Price</p>
                                    <p className="text-4xl font-bold text-matrix-text-primary">{currency.format(product.price)}</p>
                                </div>
                                <div className="flex items-center gap-2 rounded-full border border-matrix-border/30 bg-matrix-dark px-3 py-1 text-xs text-matrix-text-secondary">
                                    <Shield className="h-4 w-4 text-primary" /> Secure checkout
                                </div>
                            </div>
                            <div className="mt-4 grid gap-3">
                                <Button className="w-full" onClick={() => handleAddToCart()}>
                                    Add to cart
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  className="w-full" 
                                  onClick={() => window.location.href = '/bookings?type=free'}
                                >
                                    Free 30-min discovery call
                                </Button>
                                <Button 
                                  variant="ghost"
                                  className="w-full text-accent hover:text-accent hover:bg-accent/10"
                                  onClick={() => window.location.href = '/bookings?type=paid&from=product'}
                                >
                                    + $50 consultation with purchase
                                </Button>
                                <p className="text-xs text-matrix-text-secondary text-center">One-time purchase. Includes install walkthrough & email support.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-matrix-border/30 bg-matrix-darker p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                            <h3 className="text-lg font-semibold text-matrix-text-primary">What's included</h3>
                            <ul className="mt-4 space-y-3 text-sm text-matrix-text-secondary">
                                {product.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-matrix-border/30 bg-matrix-darker p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                            <h3 className="text-lg font-semibold text-matrix-text-primary">Tech stack</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {product.techStack.map((tech) => (
                                    <span key={tech} className="rounded-full bg-matrix-dark px-3 py-1 text-sm text-matrix-text-secondary">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
