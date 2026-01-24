// Global feature flags
// SIMPLE_CONSULTING_MODE collapses the marketing surface into a booking-first consulting funnel

export const SIMPLE_CONSULTING_MODE =
  process.env.NEXT_PUBLIC_SIMPLE_CONSULTING_MODE !== 'false'
