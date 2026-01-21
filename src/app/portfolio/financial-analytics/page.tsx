import Link from "next/link";
import { ArrowLeft, LineChart, PieChart, TrendingUp, DollarSign, Github } from "lucide-react";
import { Button } from "@/components/ui";

export default function FinancialAnalyticsProject() {
    return (
        <div className="min-h-screen bg-matrix-black">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <Link href="/portfolio" className="inline-flex items-center gap-2 text-matrix-text-secondary hover:text-matrix-primary transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Portfolio
                </Link>

                <div className="mb-16">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-matrix-primary/10 text-matrix-primary border-matrix-border mb-4">
                        In Development
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-matrix-text-primary mb-4 font-mono">
                        Financial Analytics Dashboard
                    </h1>
                    <p className="text-xl text-matrix-text-secondary max-w-3xl mb-6">
                        Multi-portfolio tracking with tax reporting, rebalancing recommendations, and investment insights
                    </p>
                    <div className="flex gap-4">
                        <Button size="lg">
                            <LineChart className="w-4 h-4 mr-2" />
                            View Demo
                        </Button>
                        <Button variant="secondary" size="lg">
                            <Github className="w-4 h-4 mr-2" />
                            Documentation
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: "Portfolios Tracked", value: "15+" },
                        { label: "Assets Supported", value: "5,000+" },
                        { label: "Data Sources", value: "8" },
                        { label: "Real-Time Updates", value: "Yes" },
                    ].map((stat) => (
                        <div key={stat.label} className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker">
                            <p className="text-matrix-text-secondary text-sm mb-2 font-medium">{stat.label}</p>
                            <p className="text-matrix-text-primary text-2xl font-bold font-mono">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-matrix-text-primary mb-8 font-mono">Project Overview</h2>
                    <div className="p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker">
                        <p className="text-matrix-text-secondary text-lg leading-relaxed mb-8">
                            A comprehensive financial analytics platform that aggregates multiple investment
                            portfolios (stocks, crypto, real estate) into a unified dashboard. Features include
                            tax-loss harvesting recommendations, asset allocation analysis, and automated rebalancing.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <PieChart className="w-8 h-8 text-matrix-primary" />,
                                    title: "Portfolio Aggregation",
                                    description: "Combine multiple accounts and asset classes into one view"
                                },
                                {
                                    icon: <DollarSign className="w-8 h-8 text-matrix-primary" />,
                                    title: "Tax Optimization",
                                    description: "Identify tax-loss harvesting opportunities to minimize liabilities"
                                },
                                {
                                    icon: <TrendingUp className="w-8 h-8 text-matrix-primary" />,
                                    title: "Performance Analytics",
                                    description: "Track returns, benchmark against indices, and analyze risk metrics"
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-lg border border-matrix-border/10 bg-matrix-dark hover:border-matrix-border/30 transition-colors">
                                    <div className="mb-4 p-4 bg-matrix-primary/10 rounded-xl shadow-matrix">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-matrix-text-primary font-semibold text-lg mb-2 font-mono">{item.title}</h3>
                                    <p className="text-matrix-text-secondary text-sm">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-matrix-text-primary mb-8 font-mono">Technology Stack</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                category: "Frontend",
                                technologies: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Recharts"]
                            },
                            {
                                category: "Backend & Data",
                                technologies: ["Prisma ORM", "PostgreSQL", "Redis Cache", "REST API"]
                            },
                            {
                                category: "Integrations",
                                technologies: ["Plaid API", "Alpha Vantage", "CoinGecko", "IEX Cloud"]
                            },
                        ].map((stack) => (
                            <div key={stack.category} className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker">
                                <h3 className="text-matrix-primary font-semibold mb-4 font-mono">{stack.category}</h3>
                                <ul className="space-y-2">
                                    {stack.technologies.map((tech) => (
                                        <li key={tech} className="flex items-center gap-2 text-matrix-text-secondary text-sm">
                                            <span className="text-matrix-primary">▸</span>
                                            {tech}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-matrix-text-primary mb-8 font-mono">Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Real-Time Portfolio Tracking",
                                description: "Live updates from multiple data sources with sub-second latency. Track stocks, crypto, bonds, and alternative investments in one place."
                            },
                            {
                                title: "Tax Loss Harvesting",
                                description: "Automated identification of tax-loss harvesting opportunities. Calculate potential tax savings and get actionable recommendations."
                            },
                            {
                                title: "Asset Allocation Analysis",
                                description: "Visualize portfolio composition across asset classes, sectors, and geographies. Compare against target allocations with rebalancing suggestions."
                            },
                            {
                                title: "Performance Metrics",
                                description: "Track returns with time-weighted and money-weighted calculations. Benchmark against indices like S&P 500, and analyze risk-adjusted metrics."
                            },
                        ].map((feature) => (
                            <div key={feature.title} className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker hover:border-matrix-border/40 hover:shadow-matrix transition-all">
                                <h3 className="text-matrix-text-primary font-semibold text-lg mb-3 font-mono">{feature.title}</h3>
                                <p className="text-matrix-text-secondary text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="text-center p-12 rounded-lg border border-matrix-border/20 bg-matrix-darker">
                    <h2 className="text-3xl font-bold text-matrix-text-primary mb-4 font-mono">Interested in This Project?</h2>
                    <p className="text-matrix-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                        This platform is currently in active development. Contact me to discuss similar solutions for your needs.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/contact">
                            <Button size="lg">Get in Touch</Button>
                        </Link>
                        <Link href="/portfolio">
                            <Button variant="secondary" size="lg">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Portfolio
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
