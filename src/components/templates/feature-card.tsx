'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/icon'
import { type IconProps } from '@/components/ui/icon'

interface Feature {
  text: string
}

interface FeatureCardProps {
  icon: IconProps['name']
  title: string
  description: string
  features: Feature[]
  cta?: {
    label: string
    href: string
  }
  gradient?: 'blue' | 'cyan' | 'green' | 'purple'
  onClick?: () => void
}

const GRADIENTS = {
  blue: 'from-blue-500 to-blue-600',
  cyan: 'from-cyan-500 to-cyan-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
}

export function FeatureCard({
  icon,
  title,
  description,
  features,
  cta,
  gradient = 'blue',
  onClick,
}: FeatureCardProps) {
  return (
    <div className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-all duration-200 overflow-hidden h-full flex flex-col">
      {/* Icon Header */}
      <div className={`bg-gradient-to-r ${GRADIENTS[gradient]} p-4 flex items-center justify-center`}>
        <div className="bg-white/20 rounded-lg p-3">
          <Icon name={icon} size="lg" color="white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Features List */}
        <ul className="space-y-2 flex-1">
          {features.map((feature, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Icon
                name="Check"
                size="sm"
                color="success"
                className="flex-shrink-0 mt-0.5"
              />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {cta && (
          <div className="pt-4">
            {cta.href ? (
              <Link href={cta.href}>
                <Button variant="primary" size="md" className="w-full">
                  {cta.label}
                  <Icon name="ArrowRight" size="sm" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={onClick}
              >
                {cta.label}
                <Icon name="ArrowRight" size="sm" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
