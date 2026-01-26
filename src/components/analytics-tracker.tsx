'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Generate or retrieve a persistent session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const previousPath = useRef<string>('');

  useEffect(() => {
    // Don't track if pathname hasn't changed
    if (pathname === previousPath.current) return;
    previousPath.current = pathname || '';

    // Track the page view
    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer,
            sessionId,
          }),
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [pathname, session]);

  return null; // This component doesn't render anything
}
