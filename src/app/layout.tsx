import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Suspense } from 'react';
import { Providers } from '@/components/providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import SessionTimeout from '@/components/SessionTimeout';
import { Navigation } from '@/components/Navigation';
import { CookieConsent } from '@/components/CookieConsent';

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
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="antialiased font-sans bg-matrix-black text-matrix-text-primary">
        <ErrorBoundary>
          <Providers>
            <Navigation />
            <SessionTimeout />
            <Toaster position="top-right" toastOptions={{
              className: 'bg-matrix-darker border border-matrix-border/40 text-matrix-text-primary',
            }} />
            <Suspense fallback={
              <div className="min-h-screen bg-matrix-black flex items-center justify-center">
                <div className="animate-pulse text-matrix-primary">Loading...</div>
              </div>
            }>
              {children}
            </Suspense>
            <CookieConsent />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
