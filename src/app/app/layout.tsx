import { AppShellClient } from '@/components/app-shell/AppShellClient'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShellClient>{children}</AppShellClient>
}
