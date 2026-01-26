import { AppShellClient } from '@/components/app-shell/app-shell-client'
import { cookies } from 'next/headers'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let devAdmin = false
  if (process.env.NODE_ENV === 'development') {
    try {
      // Await cookies() as it's async in Next.js 15+
      const cookieStore = await cookies()
      const val = cookieStore.get('dev_admin_mode')?.value
      devAdmin = val === 'true'
    } catch {
      // Safe fallback: enable admin in dev to avoid crashes
      devAdmin = true
    }
  }
  return <AppShellClient userRole={devAdmin ? 'admin-main' : undefined}>{children}</AppShellClient>
}
