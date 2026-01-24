'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const WARNING_BEFORE_TIMEOUT_MS = 5 * 60 * 1000 // Show warning 5 minutes before

export default function SessionTimeout() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return

    let timeoutId: NodeJS.Timeout
    let warningId: NodeJS.Timeout

    const resetTimers = () => {
      clearTimeout(timeoutId)
      clearTimeout(warningId)

      warningId = setTimeout(() => {
        // Show warning (you could add a toast here)
        console.warn('Session expiring soon')
      }, SESSION_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS)

      timeoutId = setTimeout(() => {
        signOut({ callbackUrl: '/' })
      }, SESSION_TIMEOUT_MS)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimers)
    })

    resetTimers()

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(warningId)
      events.forEach(event => {
        document.removeEventListener(event, resetTimers)
      })
    }
  }, [session])

  return null
}
