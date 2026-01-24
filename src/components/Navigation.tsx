'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { LogOut, ShoppingCart, Menu, X } from 'lucide-react'
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

interface NavigationProps {
  siteName?: string
}

export function Navigation({ siteName = 'dev-dominick' }: NavigationProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const simpleMode = SIMPLE_CONSULTING_MODE

  const isAppSection = pathname.startsWith('/app')
  const isLoggedIn = status === 'authenticated'
  const isLoadingSession = status === 'loading'

  // Scroll-aware nav background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Sync cart badge after login
  useEffect(() => {
    if (!isLoggedIn) {
      setCartCount(0)
      return
    }

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]') as Array<{ quantity?: number }>
      const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
      setCartCount(count)
    }

    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    return () => window.removeEventListener('storage', updateCartCount)
  }, [isLoggedIn])

  // Nav items - "Book a Call" handled separately as primary CTA
  const textLinks = [
    { href: '/', label: 'Home' },
    { href: '/contact', label: 'Contact' },
  ]

  // Don't show nav on app section (it has its own shell)
  if (isAppSection) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = '/'
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${scrolled
            ? 'bg-[var(--surface-base)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]'
            : 'bg-transparent border-b border-transparent'
          }
        `}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo - simplified, no box */}
            <Link
              href={isLoggedIn ? '/app' : '/'}
              className="flex items-center gap-2.5 group"
            >
              <span className="text-[var(--accent)] text-lg">●</span>
              <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-200">
                {siteName}
              </span>
            </Link>

            {/* Desktop Nav Links - typography first, no pills */}
            <div className="hidden md:flex items-center gap-8">
              {textLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`
                    relative text-sm transition-colors duration-200 py-1
                    ${isActive(item.href)
                      ? 'text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {item.label}
                  {/* Subtle underline indicator for active state */}
                  {isActive(item.href) && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[var(--accent)]/60 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Desktop auth + CTA */}
              <div className="hidden md:flex items-center gap-4">
                {isLoadingSession ? (
                  <div className="w-16 h-4 bg-[var(--surface-raised)] rounded animate-pulse" />
                ) : isLoggedIn ? (
                  <>
                    {!simpleMode && cartCount > 0 && (
                      <Link
                        href="/cart"
                        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200"
                        title="View cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-xs font-medium text-[var(--accent)]">{cartCount}</span>
                      </Link>
                    )}
                    <span className="text-sm text-[var(--text-muted)]">
                      {session.user?.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login?next=/app"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                )}

                {/* Primary CTA - the only button */}
                <Link
                  href="/bookings"
                  className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--surface-base)] rounded-md hover:bg-[var(--accent-hover)] transition-colors duration-200"
                >
                  Book a Call
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu - simple sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 z-40 bg-[var(--surface-base)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)]">
          <div className="px-4 py-6 space-y-4">
            {/* Text links */}
            {textLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block text-base py-2 transition-colors duration-200
                  ${isActive(item.href)
                    ? 'text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-muted)]'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-[var(--border-subtle)] my-4" />

            {/* Auth state */}
            {isLoggedIn ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-muted)]">{session?.user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login?next=/app"
                className="block text-base text-[var(--text-muted)] py-2"
              >
                Sign In
              </Link>
            )}

            {/* Primary CTA */}
            <Link
              href="/bookings"
              className="block w-full text-center px-4 py-3 text-sm font-medium bg-[var(--accent)] text-[var(--surface-base)] rounded-md hover:bg-[var(--accent-hover)] transition-colors duration-200"
            >
              Book a Call
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
