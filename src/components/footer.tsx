'use client'

import Link from 'next/link'
import Script from 'next/script'
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
              <p className="text-xs text-neutral-500 mb-4">Available for contract and full-time roles</p>
              
              {/* Buy Me a Coffee */}
              <a
                href="https://www.buymeacoffee.com/domalbano3b"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black text-xs font-medium rounded-md transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364z"/>
                </svg>
                Buy me a coffee
              </a>
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
