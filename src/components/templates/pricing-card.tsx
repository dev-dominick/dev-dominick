'use client'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

interface PricingFeature {
  text: string
  included: boolean
}

interface PricingCardProps {
  name: string
  price: number
  period?: string
  description?: string
  features: PricingFeature[]
  cta: {
    label: string
    onClick: () => void
  }
  highlighted?: boolean
}

export function PricingCard({
  name,
  price,
  period = '/month',
  description,
  features,
  cta,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-lg border transition-all duration-200 overflow-hidden ${
        highlighted
          ? 'border-blue-500 dark:border-blue-400 shadow-lg dark:shadow-xl bg-gradient-to-b from-blue-50 dark:from-blue-950 to-white dark:to-slate-800 ring-2 ring-blue-500/20 dark:ring-blue-400/20'
          : 'border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg bg-white dark:bg-slate-800'
      }`}
    >
      {highlighted && (
        <div className="bg-blue-500 dark:bg-blue-600 text-white text-center text-xs font-bold tracking-wider py-2 px-4">
          MOST POPULAR
        </div>
      )}

      <div className="p-6 flex flex-col h-full gap-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            ${price.toLocaleString()}
          </span>
          <span className="text-slate-600 dark:text-slate-400">{period}</span>
        </div>

        {/* Features */}
        <ul className="space-y-3 flex-1">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className={`flex gap-3 text-sm ${
                feature.included
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon
                name={feature.included ? 'Check' : 'X'}
                size="sm"
                color={feature.included ? 'success' : 'muted'}
                className="flex-shrink-0 mt-0.5"
              />
              <span className={feature.included ? '' : 'line-through'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          variant={highlighted ? 'primary' : 'secondary'}
          size="md"
          className="w-full"
          onClick={cta.onClick}
        >
          {cta.label}
        </Button>
      </div>
    </div>
  )
}
