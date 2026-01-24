'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/icon'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
  allowMultiple?: boolean
}

export function FAQAccordion({ items, allowMultiple = false }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndex(openIndex === index ? null : index)
    } else {
      setOpenIndex(openIndex === index ? null : index)
    }
  }

  return (
    <div className="space-y-3 w-full">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm dark:hover:shadow-md"
        >
          <button
            onClick={() => handleToggle(index)}
            className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 text-left"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-6">
              {item.question}
            </h3>
            <Icon
              name={openIndex === index ? 'ChevronUp' : 'ChevronDown'}
              size="md"
              color="secondary"
              className="flex-shrink-0"
            />
          </button>

          {openIndex === index && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 animate-slideDown">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-6 whitespace-pre-wrap">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
