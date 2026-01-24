'use client'

import { useDarkMode } from '@/hooks/useDarkMode'
import { Icon } from '@/components/ui/icon'

interface DarkModeToggleProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function DarkModeToggle({ showLabel = false, size = 'md' }: DarkModeToggleProps) {
  const { isDark, toggle, mounted } = useDarkMode()

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon
        name={isDark ? 'Sun' : 'Moon'}
        size={size}
        color={isDark ? 'warning' : 'secondary'}
      />
      {showLabel && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}
