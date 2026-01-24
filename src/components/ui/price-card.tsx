import Link from "next/link";
import { Card } from "./Card";

export interface PriceCardProps {
    title: string;
    description: string;
    priceUsd: number;
    features?: string[];
    ctaHref?: string;
    ctaLabel?: string;
}

export function PriceCard({ title, description, priceUsd, features = [], ctaHref = "/contact", ctaLabel = "Get Started" }: PriceCardProps) {
    return (
        <Card className="p-6 group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-lg font-semibold text-matrix-text-primary font-mono">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-matrix-primary font-mono">${priceUsd.toLocaleString()}</span>
                </div>
            </div>
            <p className="text-sm text-matrix-text-secondary leading-relaxed">{description}</p>
            {features.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-matrix-text-secondary">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="inline-block mt-1.5 h-1.5 w-1.5 rounded-full bg-matrix-primary shrink-0" />
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
            )}
            <Link href={ctaHref} className="mt-6 inline-flex w-full h-10 items-center justify-center rounded-md bg-matrix-primary text-matrix-black px-4 text-sm font-medium hover:bg-matrix-secondary hover:shadow-matrix transition-all duration-200 font-mono">
                {ctaLabel}
            </Link>
        </Card>
    );
}
