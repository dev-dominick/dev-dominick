"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Download, ArrowRight, Shield } from "lucide-react";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get("session_id");
        setSessionId(id);
        localStorage.removeItem("shop_cart");
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-matrix-black text-matrix-text-primary">
            <div className="fixed inset-0 pointer-events-none opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--color-primary))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-primary))_1px,transparent_1px)] bg-[length:60px_60px]" />
            </div>

            <div className="flex min-h-screen items-center justify-center px-4 py-16">
                <div className="w-full max-w-2xl rounded-2xl border border-matrix-border/40 bg-matrix-darker/90 p-10 text-center shadow-soft">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="h-9 w-9" />
                    </div>

                    <h1 className="mb-3 text-3xl font-bold">Payment successful</h1>
                    <p className="mb-8 text-matrix-text-secondary">
                        Thanks for booking your consultation. Secure your spot by scheduling your call now.
                    </p>

                    <div className="mb-8 rounded-xl border border-matrix-border/40 bg-matrix-dark p-6 text-left">
                        <h2 className="mb-3 flex items-center gap-2 font-semibold text-matrix-text-primary">
                            <Download className="h-4 w-4" />
                            What&apos;s next
                        </h2>
                        <ul className="space-y-3 text-matrix-text-secondary">
                            <li className="flex items-start gap-3">
                                <Check className="mt-0.5 h-4 w-4 text-primary" />
                                <span>Schedule your consultation now so we lock your time.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="mt-0.5 h-4 w-4 text-primary" />
                                <span>Check your email for confirmation and next steps.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="mt-0.5 h-4 w-4 text-primary" />
                                <span>Need anything urgent? Reply to the confirmation or contact us.</span>
                            </li>
                        </ul>
                    </div>

                    {sessionId && (
                        <p className="mb-6 text-sm text-matrix-text-secondary">
                            Order ID:
                            <span className="ml-2 rounded px-2 py-1 font-mono text-matrix-text-primary border border-matrix-border/40 bg-matrix-dark">
                                {sessionId.slice(-8)}
                            </span>
                        </p>
                    )}

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/appointments"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-bg shadow-soft hover:brightness-110 sm:w-auto"
                        >
                            Schedule your consultation
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/shop"
                            className="inline-flex w-full items-center justify-center rounded-lg border border-matrix-border/40 px-6 py-3 font-semibold text-matrix-text-primary hover:border-matrix-primary sm:w-auto"
                        >
                            Continue shopping
                        </Link>
                    </div>

                    <p className="mt-6 flex items-center justify-center gap-2 text-xs text-matrix-text-secondary">
                        <Shield className="h-4 w-4 text-primary" />
                        Need help? Contact support@yoursite.com
                    </p>
                </div>
            </div>
        </div>
    );
}
