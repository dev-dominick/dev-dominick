import catalog from './catalog.json'

type CatalogRecord = {
  id: string
  name: string
  price: number
  description: string
  longDescription: string
  category: string
  features: string[]
  techStack: string[]
  rating: number
  reviews: number
  downloads: number
  envPriceKey: string
  stripePriceIdFallback: string
}

export type CatalogProduct = CatalogRecord & {
  stripePriceId: string
}

function resolveStripePriceId(record: CatalogRecord): string {
  const envValue = process.env[record.envPriceKey]
  return envValue && envValue.length > 0 ? envValue : record.stripePriceIdFallback
}

export const catalogProducts: CatalogProduct[] = catalog.map((record) => ({
  ...record,
  stripePriceId: resolveStripePriceId(record),
}))

export function getProductById(id: string): CatalogProduct | undefined {
  return catalogProducts.find((product) => product.id === id)
}

export function listCategories(): string[] {
  return Array.from(new Set(catalogProducts.map((product) => product.category)))
}
