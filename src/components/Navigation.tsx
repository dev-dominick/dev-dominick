'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'

interface NavigationProps {
  siteName?: string
}

export function Navigation({ siteName = 'dev-dominick' }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isAppSection = pathname.startsWith('/app')
  const isLoggedIn = status === 'authenticated'
  const isLoadingSession = status === 'loading'

  // Marketing nav items (for logged-out users and public pages)
  const marketingNavItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ]

  // App nav items (for logged-in users)
  const appNavItems = [
    { href: '/app', label: 'Dashboard' },
  ]

  // Don't show nav on auth pages or app section (they have their own headers/shells)
  if (isAuthPage || isAppSection) {
    return null
  }

  const navItems = isLoggedIn ? appNavItems : marketingNavItems

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-matrix-border/20 bg-matrix-black/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={isLoggedIn ? '/app' : '/'}
            className="flex items-center gap-2 font-bold font-mono text-matrix-text-primary hover:text-matrix-primary transition-colors duration-200 tracking-tight"
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
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium font-mono transition-all duration-200
                    ${isActive
                      ? 'bg-matrix-primary/10 text-matrix-primary border border-matrix-border shadow-matrix'
                      : 'text-matrix-text-secondary hover:text-matrix-primary hover:bg-matrix-dark'
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
            {isLoadingSession ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-matrix-dark rounded-md animate-pulse">
                <div className="w-4 h-4 bg-matrix-gray rounded" />
                <div className="w-32 h-4 bg-matrix-gray rounded" />
              </div>
            ) : isLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-matrix-dark rounded-md">
                  <User className="w-4 h-4 text-matrix-text-secondary" />
                  <span className="text-sm text-matrix-text-primary font-mono">{session.user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium font-mono text-matrix-text-secondary hover:text-matrix-primary hover:bg-matrix-dark rounded-md transition-all duration-200"
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
                  className="px-4 py-2 text-sm font-medium font-mono text-matrix-text-secondary hover:text-matrix-primary hover:bg-matrix-dark rounded-md transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 text-sm font-semibold font-mono bg-matrix-primary text-matrix-black rounded-lg hover:bg-matrix-secondary hover:shadow-matrix transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
