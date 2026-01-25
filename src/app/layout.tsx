import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Suspense } from 'react';
import { Providers } from '@/components/providers';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from 'react-hot-toast';
import SessionTimeout from '@/components/session-timeout';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/footer';
import { CookieConsent } from '@/components/cookie-consent';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "dev-dominick | Full-Stack Development",
  description: "Principal-level engineering for modern web applications. TypeScript, React, Next.js, and Node.js expertise.",
  icons: {
    icon: '/code-cloud-logo.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D0208',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="antialiased font-sans bg-neutral-950 text-neutral-50">
        <ErrorBoundary>
          <Providers>
            {/* Accessibility: Skip to main content link */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-black focus:rounded-md focus:font-medium"
            >
              Skip to main content
            </a>
            <Navigation />
            <SessionTimeout />
            <Toaster position="top-right" toastOptions={{
              className: 'bg-neutral-900 border border-neutral-800 text-neutral-50 shadow-lg',
            }} />
            <Suspense fallback={
              <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-pulse text-primary-400">Loading...</div>
              </div>
            }>
              <main id="main-content">
                {children}
              </main>
            </Suspense>
            <Footer />
            <CookieConsent />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
