'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Icon } from '@/components/ui/icon'
import { Container, Section, Input, Button } from '@/components/ui'
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

const footerLinks = {
  engage: [
    { label: 'Book a call', href: '/bookings', primary: true },
    { label: 'Contact', href: '/contact' },
    { label: 'Home', href: '/' },
  ],
  resources: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dominick-albano/', external: true },
    { label: 'GitHub', href: 'https://github.com/dev-dominick', external: true },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ],
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const simpleMode = SIMPLE_CONSULTING_MODE

  const engageLinks = simpleMode
    ? [{ label: 'Book a call', href: '/bookings', primary: true }]
    : footerLinks.engage

  const resourceLinks = simpleMode
    ? footerLinks.resources.filter((link) => link.label === 'Contact' || link.external)
    : footerLinks.resources

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('Already subscribed!')
        } else {
          toast.error(data.error || 'Failed to subscribe')
        }
        return
      }

      setEmail('')
      toast.success('Check your email for a welcome message!')
    } catch (error) {
      console.error('Newsletter error:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="relative bg-neutral-950 border-t border-neutral-800/50">
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--accent-subtle)] via-transparent to-transparent pointer-events-none" />

      {/* Newsletter Section */}
      <Section className="py-16 border-b border-neutral-800/50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay updated</h3>
              <p className="text-neutral-400">Occasional updates on availability and projects. No spam.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-neutral-900 border-neutral-800"
                required
              />
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="whitespace-nowrap"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </Container>
      </Section>

      {/* Main Footer Content */}
      <Section className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-1">
              <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center group-hover:bg-[var(--accent)]/30 transition-colors">
                  <span className="text-[var(--accent)] font-bold text-sm">D</span>
                </div>
                <span className="font-bold text-neutral-50">dev-dominick</span>
              </Link>
              <p className="text-sm text-neutral-400 mb-1">Senior Full-Stack Engineer</p>
              <p className="text-xs text-neutral-500 mb-3">React · Next.js · Node · Postgres</p>
              <p className="text-xs text-neutral-500">Available for contract and full-time roles</p>
            </div>

            {/* Engage */}
            <div>
              <h4 className="font-semibold text-neutral-50 mb-4 text-sm uppercase tracking-wider">Engage</h4>
              <ul className="space-y-3">
                {engageLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`transition-colors text-sm inline-flex items-center gap-1 ${
                        link.primary
                          ? 'text-[var(--accent)] font-medium hover:text-[var(--accent-hover)]'
                          : 'text-neutral-400 hover:text-[var(--accent)]'
                      }`}
                    >
                      {link.label}
                      {link.primary && <Icon name="ArrowRight" size="xs" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-neutral-50 mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-[var(--accent)] transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {link.label}
                        <Icon name="ExternalLink" size="xs" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-neutral-400 hover:text-[var(--accent)] transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium text-neutral-500 mb-4 text-xs uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-500 hover:text-neutral-300 transition-colors text-xs"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-neutral-50 mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/bookings"
                    className="text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors text-sm inline-flex items-center gap-1"
                  >
                    Book an intro call
                    <Icon name="ArrowRight" size="xs" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm"
                  >
                    Contact form
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@dev-dominick.com"
                    className="text-neutral-500 hover:text-neutral-300 transition-colors text-xs"
                  >
                    hello@dev-dominick.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-800/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-neutral-400">
            <div>© 2026 dev-dominick. All rights reserved.</div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[var(--accent)] transition-colors">
                Terms
              </Link>
              <a
                href="mailto:hello@dev-dominick.com"
                className="hover:text-[var(--accent)] transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </footer>
  )
}
