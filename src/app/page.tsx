import Link from 'next/link'
import { Button } from '@/components/ui'
import { Terminal, ShoppingBag, CalendarClock, ShieldCheck, Sparkles } from 'lucide-react'

const featuredProducts = [
  {
    title: 'Premium React Components',
    blurb: '50+ production-ready components with TypeScript',
    price: 49.99,
    href: '/shop/1',
  },
  {
    title: 'Next.js Dashboard Template',
    blurb: 'Analytics-ready admin with dark mode',
    price: 79.99,
    href: '/shop/2',
  },
  {
    title: 'E-commerce Starter Kit',
    blurb: 'Full-stack shop wired to Stripe',
    price: 129.99,
    href: '/shop/3',
  },
]

const bookingHighlights = [
  {
    title: 'Book a Session',
    body: 'Strategy, architecture, or pairing—pick a slot and we meet live.',
    href: '/appointments',
  },
  {
    title: 'Bring Your Problem',
    body: 'We troubleshoot together and leave with a clear implementation plan.',
    href: '/appointments',
  },
  {
    title: 'Ship Faster',
    body: 'Hands-on help so you can get code into production quickly and safely.',
    href: '/appointments',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-matrix-black">
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Hero: choose your path */}
      <div className="relative z-10 px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Terminal className="w-5 h-5 text-matrix-primary" />
            <span className="text-sm font-semibold text-matrix-primary uppercase tracking-wider font-mono">
              Build with confidence
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 font-mono text-matrix-text-primary leading-tight">
            Shop products or book time
            <span className="block text-matrix-secondary">either way, you ship faster</span>
          </h1>

          <p className="text-lg sm:text-xl text-matrix-text-secondary max-w-3xl mx-auto mb-10">
            Pre-built resources for instant velocity, or hands-on sessions to unblock your roadmap. Matrix-grade quality, zero fluff.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto">
                Shop products
              </Button>
            </Link>
            <Link href="/appointments">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Book a session
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-matrix-text-secondary">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-matrix-primary" />
              <span>Secure Stripe checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-matrix-primary" />
              <span>Live sessions with real outcomes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion rail */}
      <div className="relative z-10 px-4 pb-14 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl border border-matrix-border/30 bg-matrix-darker/80 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="w-5 h-5 text-matrix-primary" />
              <h3 className="text-xl font-semibold text-matrix-text-primary font-mono">Shop</h3>
            </div>
            <p className="text-matrix-text-secondary mb-6">
              Production-ready templates and components wired for Stripe. Launch faster without reinventing the stack.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop">
                <Button size="lg">Browse products</Button>
              </Link>
              <Link href="/cart" className="inline-flex">
                <Button variant="ghost" size="lg">View cart</Button>
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-matrix-border/30 bg-matrix-darker/80 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <CalendarClock className="w-5 h-5 text-matrix-primary" />
              <h3 className="text-xl font-semibold text-matrix-text-primary font-mono">Book</h3>
            </div>
            <p className="text-matrix-text-secondary mb-6">
              Get live guidance: architecture, performance, integrations, or pair-programming to unblock shipping.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/appointments">
                <Button size="lg" variant="secondary">Schedule now</Button>
              </Link>
              <Link href="/contact" className="inline-flex">
                <Button variant="ghost" size="lg">Ask a question</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured products */}
      <div className="relative z-10 px-4 pb-16 sm:px-6 lg:px-8 border-t border-matrix-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-matrix-text-primary font-mono">Featured products</h2>
            <Link href="/shop" className="text-matrix-primary font-mono text-sm hover:underline">
              See all products
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.title}
                className="p-6 rounded-2xl border border-matrix-border/30 bg-matrix-darker/70 hover:border-matrix-primary/50 hover:shadow-matrix transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-matrix-text-primary">{product.title}</h3>
                  <Sparkles className="w-4 h-4 text-matrix-secondary" />
                </div>
                <p className="text-matrix-text-secondary mb-4">{product.blurb}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-matrix-text-primary">${product.price.toFixed(2)}</span>
                  <Link href={product.href} className="inline-flex">
                    <Button size="sm" variant="secondary">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking highlights */}
      <div className="relative z-10 px-4 pb-16 sm:px-6 lg:px-8 border-t border-matrix-border/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {bookingHighlights.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl border border-matrix-border/30 bg-matrix-darker/80 hover:border-matrix-primary/40 transition-all duration-200"
            >
              <h3 className="text-xl font-semibold text-matrix-text-primary mb-3 font-mono">{item.title}</h3>
              <p className="text-matrix-text-secondary mb-4">{item.body}</p>
              <Link href={item.href} className="text-matrix-primary font-mono text-sm hover:underline">Book now</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 px-4 pb-20 sm:px-6 lg:px-8 border-t border-matrix-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-matrix-text-primary font-mono">Pick your path and start</h2>
          <p className="text-lg text-matrix-text-secondary mb-8">
            Whether you need a ready-to-ship template or a focused session, the goal is the same: ship solid software, fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg">Shop products</Button>
            </Link>
            <Link href="/appointments">
              <Button variant="secondary" size="lg">Book a session</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

