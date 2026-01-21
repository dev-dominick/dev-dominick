/**
 * Cookie Consent Banner
 * 
 * SSR-Safe: Uses mount gate to prevent hydration mismatches.
 * Server renders null, client checks localStorage after hydration.
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/lib/ui';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mount gate: only check localStorage after hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-300">
            We use cookies to enhance your browsing experience and analyze site traffic.
            By continuing to use this site, you consent to our use of cookies.{' '}
            <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
              Privacy Policy
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={declineCookies}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={acceptCookies}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
