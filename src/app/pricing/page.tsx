'use client';

import { Button } from '@/components/ui';
import Link from "next/link";
import { Check, X } from "lucide-react";
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

export default function PricingPage() {
  const simpleMode = SIMPLE_CONSULTING_MODE

  if (simpleMode) {
    return (
      <div className="min-h-screen bg-matrix-black">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-matrix-text-primary font-mono">Consulting</h1>
            <p className="text-xl text-matrix-text-secondary max-w-3xl mx-auto">
              Book a free discovery call. If we click, you can opt into a deeper 60–90 minute technical session for architecture, risk, and execution clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker">
              <h2 className="text-2xl font-bold text-matrix-text-primary font-mono mb-2">Free Discovery Call</h2>
              <p className="text-matrix-text-secondary mb-4">30 minutes to understand your goals and assess fit.</p>
              <ul className="space-y-2 text-matrix-text-secondary text-sm">
                <li className="flex items-start gap-2"><span className="text-matrix-primary">✓</span> Current state + blockers</li>
                <li className="flex items-start gap-2"><span className="text-matrix-primary">✓</span> Risks and blind spots</li>
                <li className="flex items-start gap-2"><span className="text-matrix-primary">✓</span> Recommended next steps</li>
              </ul>
              <Link href="/bookings?type=free" className="inline-block mt-6">
                <Button>Book free call</Button>
              </Link>
            </div>

            <div className="p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker">
              <h2 className="text-2xl font-bold text-matrix-text-primary font-mono mb-2">Technical Review Session</h2>
              <p className="text-matrix-text-secondary mb-4">60–90 minutes. Starter price $150–$300.</p>
              <ul className="space-y-2 text-matrix-text-secondary text-sm">
                <li className="flex items-start gap-2"><span className="text-matrix-primary">✓</span> Architecture and execution plan</li>
                <li className="flex items-start gap-2"><span className="text-matrix-primary">✓</span> Build vs buy guidance</li>
                <li className="flex items-start gap-2"><span className="text-matrix-primary">✓</span> Timeline and risk reduction</li>
                <li className="flex items-start gap-2"><span className="text-matrix-primary">✓</span> Action checklist you can run with</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link href="/bookings" className="inline-block">
                  <Button className="w-full">Book session</Button>
                </Link>
                <Link href="/contact" className="inline-block">
                  <Button variant="outline" className="w-full border-matrix-border/50 text-matrix-text-primary">
                    Talk first
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker text-center space-y-4">
            <h3 className="text-2xl font-bold text-matrix-text-primary font-mono">What you leave with</h3>
            <p className="text-matrix-text-secondary max-w-3xl mx-auto">
              A concise plan: risks, priorities, build-vs-buy calls, and the next 2–3 milestones. No sales pressure—just clarity.
            </p>
            <Link href="/bookings" className="inline-block">
              <Button size="lg">Book now</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const packages = [
    {
      name: "Website Starter",
      price: "$2,500",
      description: "Perfect for local businesses establishing online presence",
      planId: "starter",
      features: [
        { name: "5-10 page website", included: true },
        { name: "Mobile responsive design", included: true },
        { name: "SEO optimization", included: true },
        { name: "Contact form", included: true },
        { name: "Google Maps integration", included: true },
        { name: "3 rounds of revisions", included: true },
        { name: "2 months support", included: true },
        { name: "E-commerce", included: false },
        { name: "Custom backend", included: false },
      ],
      cta: "Get Started",
      popular: false,
      planId: "starter",
      stripeId: "price_1Q123456"
    },
    {
      name: "Business Pro",
      price: "$7,500",
      description: "Full-featured solution for growing businesses",
      planId: "business",
      features: [
        { name: "Unlimited pages", included: true },
        { name: "Mobile & tablet responsive", included: true },
        { name: "Advanced SEO", included: true },
        { name: "Contact & booking forms", included: true },
        { name: "E-commerce setup (Stripe)", included: true },
        { name: "Admin dashboard", included: true },
        { name: "Customer management", included: true },
        { name: "Email notifications", included: true },
        { name: "Analytics dashboard", included: true },
        { name: "6 months support", included: true },
        { name: "Monthly updates", included: true },
      ],
      cta: "Most Popular",
      popular: true,
      planId: "business",
      stripeId: "price_1Q234567"
    },
    {
      name: "Enterprise Solution",
      price: "$12,500+",
      description: "Custom solution for complex business needs",
      planId: "enterprise",
      features: [
        { name: "Everything in Business Pro", included: true },
        { name: "Custom database design", included: true },
        { name: "API integrations", included: true },
        { name: "Payment processing", included: true },
        { name: "Multi-location support", included: true },
        { name: "User authentication", included: true },
        { name: "Real-time features", included: true },
        { name: "Advanced reporting", included: true },
        { name: "12 months support", included: true },
        { name: "Quarterly reviews", included: true },
      ],
      cta: "Contact for Quote",
      popular: false,
      planId: "enterprise",
      stripeId: "price_1Q345678"
    },
  ];

  const addons = [
    { name: "Extra pages (per 5)", price: "$500", stripeId: "price_addons_pages" },
    { name: "Appointment booking", price: "$1,200", stripeId: "price_addons_booking" },
    { name: "Email automation", price: "$1,500", stripeId: "price_addons_email" },
    { name: "Blog system", price: "$1,000", stripeId: "price_addons_blog" },
    { name: "Payment integration", price: "$800", stripeId: "price_addons_payment" },
    { name: "Analytics setup", price: "$600", stripeId: "price_addons_analytics" },
    { name: "Monthly maintenance", price: "$400/mo", stripeId: "price_addons_maintenance" },
    { name: "Priority support", price: "$300/mo", stripeId: "price_addons_support" },
  ];

  return (
    <div className="min-h-screen bg-matrix-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-matrix-text-primary mb-4 font-mono">Pricing</h1>
          <p className="text-xl text-matrix-text-secondary max-w-3xl mx-auto">Transparent pricing for quality work</p>
          <p className="mt-3 text-sm text-matrix-text-muted">Want fixed-price starter kits? <Link href="/shop" className="text-matrix-primary hover:underline">Shop packages</Link> from $1,499.</p>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4 text-matrix-text-primary font-mono">Choose Your Package</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`p-8 rounded-lg border bg-matrix-darker ${pkg.popular
                    ? 'border-matrix-primary ring-2 ring-matrix-border/20 scale-105 shadow-matrix-lg'
                    : 'border-matrix-border/20'
                  }`}
              >
                {pkg.popular && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-matrix-primary/10 text-matrix-primary border-matrix-border mb-4">
                    Most Popular
                  </span>
                )}

                <h3 className="text-matrix-text-primary font-bold text-2xl mb-2 font-mono">{pkg.name}</h3>
                <p className="text-matrix-text-secondary text-sm mb-6">{pkg.description}</p>

                <div className="mb-8">
                  <div className="text-4xl font-bold text-matrix-text-primary mb-1 font-mono">{pkg.price}</div>
                  {pkg.price !== "Custom" && pkg.price !== "$12,500+" && (
                    <div className="text-matrix-text-secondary text-sm">One-time payment</div>
                  )}
                  {pkg.price === "$12,500+" && (
                    <div className="text-matrix-text-secondary text-sm">Custom quote</div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-matrix-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-matrix-text-muted shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-matrix-text-secondary" : "text-matrix-text-muted"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/contact">
                  <Button className="w-full">
                    {pkg.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4 text-matrix-text-primary font-mono">Add-Ons & Extras</h2>
          <p className="text-center text-matrix-text-secondary mb-12">Enhance your package with additional features</p>
          <div className="grid md:grid-cols-4 gap-4">
            {addons.map((addon) => (
              <div key={addon.name} className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker text-center">
                <h4 className="text-matrix-text-primary font-semibold mb-2">{addon.name}</h4>
                <p className="text-matrix-primary font-bold font-mono">{addon.price}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-matrix-text-primary font-mono">Payment & Terms</h2>
          <div className="p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-matrix-text-primary font-bold text-lg mb-4 font-mono">Payment Schedule</h4>
                <ul className="space-y-3 text-matrix-text-secondary">
                  <li className="flex justify-between">
                    <span>50% Deposit</span>
                    <span className="text-matrix-text-muted">To start development</span>
                  </li>
                  <li className="flex justify-between">
                    <span>25% Midpoint</span>
                    <span className="text-matrix-text-muted">After design approval</span>
                  </li>
                  <li className="flex justify-between">
                    <span>25% Final</span>
                    <span className="text-matrix-text-muted">Upon completion</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-matrix-text-primary font-bold text-lg mb-4 font-mono">What&apos;s Included</h4>
                <ul className="space-y-2 text-matrix-text-secondary text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-matrix-primary">✓</span>
                    Complete project consultation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-matrix-primary">✓</span>
                    Design & development
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-matrix-primary">✓</span>
                    Testing & QA
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-matrix-primary">✓</span>
                    Hosting setup & deployment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-matrix-primary">✓</span>
                    Training & documentation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-matrix-primary">✓</span>
                    Post-launch support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center p-12 rounded-lg border border-matrix-border/20 bg-matrix-darker">
          <h2 className="text-4xl font-bold text-matrix-text-primary mb-4 font-mono">Questions About Pricing?</h2>
          <p className="text-matrix-text-secondary text-xl mb-8 max-w-2xl mx-auto">
            Schedule a free consultation to discuss your project and get a custom quote
          </p>
          <Link href="/contact">
            <Button size="lg">
              Book Free Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

