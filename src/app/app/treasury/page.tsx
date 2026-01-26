import { isDevEnvironment } from '@/lib/env'
import LegacyTreasuryPage from './page.legacy'
import ModularTreasuryPage from './page.modular'

/**
 * Treasury page with feature flag
 * - DEV: Uses new modular version
 * - PROD: Uses legacy version (for safety)
 */
export default function TreasuryPage() {
  const useModularVersion = isDevEnvironment()
  
  return useModularVersion ? <ModularTreasuryPage /> : <LegacyTreasuryPage />
}
