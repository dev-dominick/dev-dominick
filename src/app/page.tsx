import Link from 'next/link';
import { Button, PriceCard } from '@/components/ui';
import { Terminal, Code2, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-matrix-black">
      {/* Matrix grid background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Terminal className="w-5 h-5 text-matrix-primary" />
            <span className="text-sm font-semibold text-matrix-primary uppercase tracking-wider font-mono">
              Full-Stack Development
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-center mb-6 font-mono">
            <span className="text-matrix-text-primary">Build </span>
            <span className="text-matrix-primary animate-pulse">Fast</span>
            <br />
            <span className="text-matrix-text-primary">Ship </span>
            <span className="text-matrix-secondary">Faster</span>
          </h1>

          <p className="text-xl text-matrix-text-secondary text-center max-w-3xl mx-auto mb-12 leading-relaxed">
            Principal-level engineering for modern web applications. TypeScript, React, Next.js, and Node.js expertise to take your product from idea to production.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto">
                Start a Project
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-4 py-20 sm:px-6 lg:px-8 border-t border-matrix-border/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-matrix-text-primary font-mono">
            Core Capabilities
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker hover:border-matrix-border/40 hover:shadow-matrix transition-all duration-300">
              <Code2 className="w-10 h-10 text-matrix-primary mb-4" />
              <h3 className="text-xl font-semibold text-matrix-text-primary mb-3 font-mono">Full-Stack Development</h3>
              <p className="text-matrix-text-secondary">
                End-to-end development from database design to polished UI. TypeScript, React, Next.js, Node.js, PostgreSQL.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker hover:border-matrix-border/40 hover:shadow-matrix transition-all duration-300">
              <Zap className="w-10 h-10 text-matrix-primary mb-4" />
              <h3 className="text-xl font-semibold text-matrix-text-primary mb-3 font-mono">Performance Optimization</h3>
              <p className="text-matrix-text-secondary">
                Server-side rendering, static generation, edge caching, and bundle optimization for lightning-fast experiences.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker hover:border-matrix-border/40 hover:shadow-matrix transition-all duration-300">
              <Shield className="w-10 h-10 text-matrix-primary mb-4" />
              <h3 className="text-xl font-semibold text-matrix-text-primary mb-3 font-mono">Security & Scale</h3>
              <p className="text-matrix-text-secondary">
                Auth implementation, API security, database optimization, and architecture designed to scale with your business.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative z-10 px-4 py-20 sm:px-6 lg:px-8 border-t border-matrix-border/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-matrix-text-primary font-mono">
            Services & Pricing
          </h2>
          <p className="text-center text-matrix-text-secondary mb-16 max-w-2xl mx-auto">
            Transparent pricing for quality work. No gimmicks, no surprises—just professional engineering.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <PriceCard
              title="MVP Build"
              description="Get your product to market fast with a fully-functional minimum viable product."
              priceUsd={8000}
              features={[
                "Full-stack application",
                "User authentication",
                "Database design & setup",
                "Deployment & hosting",
                "4-6 week delivery"
              ]}
              ctaLabel="Get Started"
            />

            <PriceCard
              title="Feature Development"
              description="Add new features to your existing application with clean, maintainable code."
              priceUsd={3500}
              features={[
                "New feature implementation",
                "API integration",
                "Testing & QA",
                "Documentation",
                "2-3 week delivery"
              ]}
              ctaLabel="Discuss Scope"
            />

            <PriceCard
              title="Technical Consultation"
              description="Architecture review, code audit, or technical planning for your next build."
              priceUsd={1200}
              features={[
                "Architecture review",
                "Technology recommendations",
                "Performance audit",
                "Security assessment",
                "Detailed report"
              ]}
              ctaLabel="Book Session"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-4 py-20 sm:px-6 lg:px-8 border-t border-matrix-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-matrix-text-primary font-mono">
            Ready to Build Something Great?
          </h2>
          <p className="text-xl text-matrix-text-secondary mb-10">
            Let's discuss your project and see how I can help bring it to life.
          </p>
          <Link href="/contact">
            <Button size="lg">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

