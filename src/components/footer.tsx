'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Icon } from '@/components/ui/icon'
import { Container, Section, Input, Button } from '@/components/ui'
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

const footerLinks = {
  product: [
    { label: 'Explore', href: '/explore' },
    { label: 'Shop', href: '/shop' },
    { label: 'Service Pricing', href: '/pricing' },
    { label: 'Bookings', href: '/bookings' },
  ],
  resources: [
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: 'https://blog.dev-dominick.com', external: true },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  social: [
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'Linkedin' },
    { label: 'GitHub', href: 'https://github.com', icon: 'Github' },
    { label: 'Twitter', href: 'https://twitter.com', icon: 'Twitter' },
  ],
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const simpleMode = SIMPLE_CONSULTING_MODE

  const productLinks = simpleMode
    ? [{ label: 'Book a call', href: '/bookings' }]
    : footerLinks.product

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
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-sky-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Newsletter Section */}
      <Section className="py-16 border-b border-neutral-800/50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay in the loop</h3>
              <p className="text-neutral-400">Get founder notes, technical guidance, and booking availability updates.</p>
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
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center group-hover:bg-sky-500/30 transition-colors">
                  <span className="text-sky-400 font-bold text-sm">D</span>
                </div>
                <span className="font-bold text-neutral-50">dev-dominick</span>
              </Link>
              <p className="text-sm text-neutral-400 mb-4">Principal-level engineering for modern web applications.</p>
              <div className="flex gap-3">
                {footerLinks.social.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-sky-300 hover:border-sky-500/30 transition-all"
                  >
                    {link.icon && <Icon name={link.icon as any} size="sm" />}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-neutral-50 mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-sky-300 transition-colors text-sm"
                    >
                      {link.label}
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
                        className="text-neutral-400 hover:text-sky-300 transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {link.label}
                        <Icon name="ExternalLink" size="xs" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-neutral-400 hover:text-sky-300 transition-colors text-sm"
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
              <h4 className="font-semibold text-neutral-50 mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-sky-300 transition-colors text-sm"
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
                  <a
                    href="mailto:hello@dev-dominick.com"
                    className="text-neutral-400 hover:text-sky-300 transition-colors text-sm"
                  >
                    hello@dev-dominick.com
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-neutral-400 hover:text-sky-300 transition-colors text-sm inline-flex items-center gap-1"
                  >
                    Contact form
                    <Icon name="ArrowRight" size="xs" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookings"
                    className="text-neutral-400 hover:text-sky-300 transition-colors text-sm inline-flex items-center gap-1"
                  >
                    Book a call
                    <Icon name="ArrowRight" size="xs" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-800/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-neutral-400">
            <div>© 2026 dev-dominick. All rights reserved.</div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-sky-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-sky-300 transition-colors">
                Terms
              </Link>
              <a
                href="mailto:hello@dev-dominick.com"
                className="hover:text-sky-300 transition-colors"
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
