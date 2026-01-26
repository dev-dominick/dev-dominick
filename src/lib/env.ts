/**
 * Environment utilities
 */

export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProdEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function getEnv(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || ''
}
