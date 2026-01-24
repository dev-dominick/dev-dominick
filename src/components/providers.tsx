'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { EntitlementProvider } from '@/contexts/EntitlementContext'
import { ToastProvider } from '@/components/ui'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <EntitlementProvider>
          {children}
        </EntitlementProvider>
      </ToastProvider>
    </SessionProvider>
  )
}
