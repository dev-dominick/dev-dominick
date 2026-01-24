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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--accent-subtle)] via-transparent to-[var(--accent-muted)]" />
        <Container>
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-muted)] border border-[var(--accent)]/20 text-[var(--accent)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
              <Icon name="Sparkles" size="sm" /> Available for projects
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-neutral-50">
                Senior Full-Stack Engineer
              </h1>
              <p className="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                I build web applications with React, Next.js, and Node. Currently taking on contract work.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/bookings" className="inline-flex items-center gap-2">
                  Book an intro call
                  <Icon name="ArrowRight" size="sm" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Send a message</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {!simpleMode && (
        <Section className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <Container>
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-3xl font-bold text-neutral-950 dark:text-neutral-50">Ways to work together</h2>
              <p className="text-neutral-600 dark:text-neutral-400">Contract projects, intro calls, or technical reviews.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-800/50">
                <CardContent className="space-y-3 pt-6">
                  <div className="text-2xl">�</div>
                  <CardTitle className="text-xl dark:text-neutral-50">Contract projects</CardTitle>
                  <CardDescription className="dark:text-neutral-400">
                    I can lead or contribute to your build. React, Node, Postgres, Stripe—whatever the stack needs.
                  </CardDescription>
                  <Button asChild variant="ghost" className="px-0 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                    <Link href="/bookings" className="inline-flex items-center gap-2">
                      Let's talk <Icon name="ArrowRight" size="sm" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-800/50">
                <CardContent className="space-y-3 pt-6">
                  <div className="text-2xl">📞</div>
                  <CardTitle className="text-xl dark:text-neutral-50">Intro call</CardTitle>
                  <CardDescription className="dark:text-neutral-400">
                    Free 30-minute conversation. Tell me what you're building and I'll share how I might help.
                  </CardDescription>
                  <Button asChild variant="ghost" className="px-0 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                    <Link href="/bookings" className="inline-flex items-center gap-2">
                      Book a time <Icon name="ArrowRight" size="sm" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-800/50">
                <CardContent className="space-y-3 pt-6">
                  <div className="text-2xl">🔍</div>
                  <CardTitle className="text-xl dark:text-neutral-50">Technical review</CardTitle>
                  <CardDescription className="dark:text-neutral-400">
                    Architecture feedback, risk assessment, or code review. $150 for a focused session.
                  </CardDescription>
                  <Button asChild variant="ghost" className="px-0 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                    <Link href="/contact" className="inline-flex items-center gap-2">
                      Get in touch <Icon name="ArrowRight" size="sm" />
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
              <h2 className="text-3xl font-bold text-neutral-950 dark:text-neutral-50">What to expect on a call</h2>
              <p className="text-neutral-600 dark:text-neutral-400">A practical conversation about your project. I'll listen, ask questions, and share how I might help.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {["Learn about your project and goals", "Discuss technical approach and tradeoffs", "Surface risks and unknowns early", "Decide together if it's a fit"].map((item) => (
                <Card key={item} className="dark:border-neutral-800 dark:bg-neutral-800/60">
                  <CardContent className="flex items-center gap-3 py-5">
                    <span className="text-[var(--accent)]">✓</span>
                    <p className="text-neutral-800 dark:text-neutral-200">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/bookings">Book an intro call</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Send a message</Link>
              </Button>
            </div>
          </Container>
        </Section>
      )}

      <Section className="bg-neutral-950 text-neutral-50">
        <Container>
          <div className="max-w-3xl text-center mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Interested in working together?</h2>
            <p className="text-lg text-neutral-400">
              Let's have a conversation. No pitch, no pressure—just a practical chat about your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-neutral-50 text-neutral-950 hover:bg-neutral-200">
                <Link href="/bookings" className="inline-flex items-center gap-2">
                  Book an intro call
                  <Icon name="ArrowRight" size="sm" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="border-neutral-50 text-neutral-50 hover:bg-neutral-50/10">
                <Link href="/contact">Send a message</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}

