'use client'

import Link from 'next/link'
import { ShoppingCart, Calendar, BookOpen, Briefcase, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

const offerings = [
  {
    icon: ShoppingCart,
    title: 'Shop Templates',
    description: 'Production-ready website & commerce kits. Ship in days, not months. Stripe payments, Calendly sync, admin dashboards—everything wired.',
    features: ['Professional Business Website', 'E-Commerce Store', 'Appointment Booking Platform'],
    cta: 'Browse Shop',
    href: '/shop',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: Calendar,
    title: 'Book Consultation',
    description: 'Whether you need a free strategy call or paid technical guidance, I\'ll review your project and map out the path forward.',
    features: ['30-min Free Discovery Call', '$50 Technical Consultation', 'Custom Project Planning'],
    cta: 'Book a Call',
    href: '/bookings?type=free',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: BookOpen,
    title: 'Coaching & Support',
    description: 'Private coaching for founders and builders. I\'ll help you architect systems, optimize for growth, and ship faster.',
    features: ['1-on-1 Sessions', 'Architecture Reviews', 'Growth Strategies'],
    cta: 'Get Details',
    href: '/contact',
    gradient: 'from-green-500 to-green-600',
  },
  {
    icon: Briefcase,
    title: 'See My Work',
    description: 'Check out case studies, client testimonials, and the systems I\'ve built. See what\'s possible when you focus on execution.',
    features: ['Portfolio Projects', 'Client Success Stories', 'Technical Deep Dives'],
    cta: 'View Portfolio',
    href: '/portfolio',
    gradient: 'from-purple-500 to-purple-600',
  },
]

export default function ExplorePage() {
  const router = useRouter()

  useEffect(() => {
    if (SIMPLE_CONSULTING_MODE) {
      router.replace('/');
    }
  }, [router])

  if (SIMPLE_CONSULTING_MODE) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
            Consulting Focus
          </div>
          <h1 className="text-4xl font-bold">Book a consulting call</h1>
          <p className="text-neutral-300">
            I help founders get technical clarity: architecture reviews, execution plans, and risk reduction. Grab time and we will map your next steps.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/bookings?type=free"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600 transition-colors"
            >
              Book a call
              <ArrowRight className="h-4 w-4" />
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
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-neutral-900 to-neutral-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Here's What I Do
          </h1>
          <p className="mt-4 text-lg text-neutral-300">
            Pick what you need, or combine them for maximum impact.
          </p>
        </div>
      </section>

      {/* Offerings Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            {offerings.map((offering, idx) => {
              const Icon = offering.icon
              return (
                <div
                  key={idx}
                  className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-900 p-8 shadow-sm hover:shadow-lg transition-shadow"
                >
                  {/* Icon */}
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${offering.gradient}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-2xl font-bold text-neutral-50 mb-2">
                    {offering.title}
                  </h2>
                  <p className="text-neutral-400 mb-6 flex-1">
                    {offering.description}
                  </p>

                  {/* Features */}
                  <ul className="mb-8 space-y-2">
                    {offering.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                        <span className="text-neutral-500 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={offering.href}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${offering.gradient} px-6 py-3 font-semibold text-white hover:shadow-lg transition-all`}
                  >
                    {offering.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="border-t border-neutral-800 bg-neutral-900 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-neutral-50 mb-4">
            Not sure where to start?
          </h2>
          <p className="mb-8 text-lg text-neutral-400">
            Let's jump on a free call and I'll point you in the right direction.
          </p>
          <Link
            href="/bookings?type=free"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-8 py-3 font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Free Discovery Call
          </Link>
        </div>
      </section>
    </main>
  )
}
