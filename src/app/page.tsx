'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Container, Section } from '@/components/ui'
import { Icon } from '@/components/ui/icon'
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

export default function HomePage() {
  const { data: session, status } = useSession()
  const simpleMode = SIMPLE_CONSULTING_MODE

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <Section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-500/5 via-transparent to-sky-500/10" />
        <Container>
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
              <Icon name="Sparkles" size="sm" /> {simpleMode ? 'Consulting-first mode' : 'Proven delivery, startup-speed'}
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                {simpleMode ? 'Book a senior engineer to de-risk your build' : 'Ship faster with'}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-sky-500">
                  {simpleMode ? 'Clarity, architecture, and next steps' : 'production-grade systems'}
                </span>
              </h1>
              <p className="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                {simpleMode
                  ? 'Get technical clarity, architecture review, and an execution plan. One call to stop guessing and move forward.'
                  : 'Templates, consulting, and coaching built for founders who need to execute. Pick what you need or combine them for maximum impact.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {session ? (
                <>
                  <Button asChild size="lg">
                    <Link href={simpleMode ? '/bookings' : '/explore'} className="inline-flex items-center gap-2">
                      {simpleMode ? 'Book a call' : 'Explore options'}
                      <Icon name="ArrowRight" size="sm" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href={simpleMode ? '/contact' : '/app'}>{simpleMode ? 'Contact' : 'Dashboard'}</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href={simpleMode ? '/bookings' : '/explore'} className="inline-flex items-center gap-2">
                      {simpleMode ? 'Book a call' : 'Explore options'}
                      <Icon name="ArrowRight" size="sm" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href={simpleMode ? '/contact' : '/signup'}>{simpleMode ? 'Contact' : 'Sign up'}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {!simpleMode && (
        <Section className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <Container>
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-3xl font-bold text-neutral-950 dark:text-neutral-50">Everything you need</h2>
              <p className="text-neutral-600 dark:text-neutral-400">Pick a path or mix them for your stack.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-800/50">
                <CardContent className="space-y-3 pt-6">
                  <div className="text-2xl">🛍️</div>
                  <CardTitle className="text-xl dark:text-neutral-50">Shop templates</CardTitle>
                  <CardDescription className="dark:text-neutral-400">
                    Production-ready website & commerce kits wired with Stripe, admin dashboards, and modern stack.
                  </CardDescription>
                  <Button asChild variant="ghost" className="px-0 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                    <Link href="/shop" className="inline-flex items-center gap-2">
                      View templates <Icon name="ArrowRight" size="sm" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-800/50">
                <CardContent className="space-y-3 pt-6">
                  <div className="text-2xl">📞</div>
                  <CardTitle className="text-xl dark:text-neutral-50">Consultations</CardTitle>
                  <CardDescription className="dark:text-neutral-400">
                    Free 30-min discovery or $50 technical consults. Get a roadmap tailored to your goals.
                  </CardDescription>
                  <Button asChild variant="ghost" className="px-0 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                    <Link href="/bookings?type=free" className="inline-flex items-center gap-2">
                      Book a call <Icon name="ArrowRight" size="sm" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-800/50">
                <CardContent className="space-y-3 pt-6">
                  <div className="text-2xl">🎓</div>
                  <CardTitle className="text-xl dark:text-neutral-50">Private coaching</CardTitle>
                  <CardDescription className="dark:text-neutral-400">
                    1-on-1 architecture reviews, growth strategies, and tactical execution support for founders.
                  </CardDescription>
                  <Button asChild variant="ghost" className="px-0 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                    <Link href="/contact" className="inline-flex items-center gap-2">
                      Learn more <Icon name="ArrowRight" size="sm" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>
      )}

      {simpleMode && (
        <Section className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <Container>
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h2 className="text-3xl font-bold text-neutral-950 dark:text-neutral-50">What you get on the call</h2>
              <p className="text-neutral-600 dark:text-neutral-400">Architecture review, risks, and a clear next-steps checklist tailored to your context.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {["Risk + architecture review", "Execution plan with 2–3 milestones", "Build vs buy guidance", "Tooling + stack recommendations"].map((item) => (
                <Card key={item} className="dark:border-neutral-800 dark:bg-neutral-800/60">
                  <CardContent className="flex items-center gap-3 py-5">
                    <span className="text-sky-400">✓</span>
                    <p className="text-neutral-800 dark:text-neutral-200">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/bookings">Book now</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Talk first</Link>
              </Button>
            </div>
          </Container>
        </Section>
      )}

      <Section className="bg-neutral-950 text-neutral-50">
        <Container>
          <div className="max-w-3xl text-center mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{simpleMode ? 'Ready to get clarity?' : 'Ready to ship?'}</h2>
            <p className="text-lg text-neutral-400">
              {simpleMode ? 'Start with a consultation to de-risk your next move.' : 'Choose your path, or start with a free consultation to figure it out.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-neutral-50 text-neutral-950 hover:bg-neutral-200">
                <Link href={simpleMode ? '/bookings' : '/explore'} className="inline-flex items-center gap-2">
                  {simpleMode ? 'Book a call' : 'Explore'}
                  <Icon name="ArrowRight" size="sm" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="border-neutral-50 text-neutral-50 hover:bg-neutral-50/10">
                <Link href={simpleMode ? '/contact' : '/bookings?type=free'}>{simpleMode ? 'Contact' : 'Free call'}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}

