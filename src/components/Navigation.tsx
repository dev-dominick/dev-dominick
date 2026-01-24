'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { LogOut, User, ShoppingCart } from 'lucide-react'
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle'
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

interface NavigationProps {
  siteName?: string
}

export function Navigation({ siteName = 'dev-dominick' }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [cartCount, setCartCount] = useState(0)
  const simpleMode = SIMPLE_CONSULTING_MODE

  const isAppSection = pathname.startsWith('/app')
  const isLoggedIn = status === 'authenticated'
  const isLoadingSession = status === 'loading'

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

  // Unified marketing nav focused on conversions
  const navItems = simpleMode
    ? [
        { href: '/', label: 'Home' },
        { href: '/contact', label: 'Contact' },
        { href: '/bookings', label: 'Book a Call' },
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/contact', label: 'Contact' },
        { href: '/bookings', label: 'Book a Call' },
      ]

  // Don't show nav on app section (it has its own shell)
  if (isAppSection) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={isLoggedIn ? '/app' : '/'}
            className="flex items-center gap-2 font-bold text-neutral-50 hover:text-primary-300 transition-colors duration-200 tracking-tight"
          >
            <img
              src="/code-cloud-logo.svg"
              alt="dev-dominick"
              className="w-8 h-8"
            />
            <span className="hidden sm:inline text-lg">
              {siteName}
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-primary-500/10 text-primary-200 border border-primary-500/40 shadow-[0_10px_40px_-20px_rgba(56,189,248,0.7)]'
                      : 'text-neutral-300 hover:text-primary-200 hover:bg-neutral-900'
                    }
                  `}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <DarkModeToggle size="sm" />
            
            {isLoadingSession ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse">
                <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="w-32 h-4 bg-slate-300 dark:bg-slate-600 rounded" />
              </div>
            ) : isLoggedIn ? (
              <>
                {!simpleMode && (
                  <Link
                    href="/cart"
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-200 hover:text-primary-200 hover:bg-neutral-900 rounded-md transition-all duration-200"
                    title="View cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="ml-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700/50">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm text-neutral-100">{session.user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-200 hover:text-primary-200 hover:bg-neutral-900 rounded-md transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?next=/app"
                  className="px-4 py-2 text-sm font-medium text-neutral-200 hover:text-primary-200 hover:bg-neutral-900 rounded-md transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href={simpleMode ? '/bookings' : '/shop'}
                  className="px-5 py-2 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-sm transition-all duration-200"
                >
                  {simpleMode ? 'Book a Call' : 'Shop Now'}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
