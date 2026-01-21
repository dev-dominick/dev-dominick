'use client'

import { SessionProvider } from 'next-auth/react'
import { EntitlementProvider } from '@/contexts/EntitlementContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <EntitlementProvider>
        {children}
      </EntitlementProvider>
    </SessionProvider>
  )
}
