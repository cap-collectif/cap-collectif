const normalizeAllowedHosts = (allowedHosts: string[]): Set<string> =>
  new Set(allowedHosts.map(host => host.trim().toLowerCase()).filter(Boolean))

const parseAbsoluteUrl = (value: string): URL | null => {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export const isAllowedSourceUrl = (value?: string, allowedHosts: string[] = []): boolean => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return true
  if (!/^https?:\/\//i.test(trimmed)) return false

  const url = parseAbsoluteUrl(trimmed)
  if (!url) return false

  const normalizedAllowedHosts = normalizeAllowedHosts(allowedHosts)
  if (!normalizedAllowedHosts.size) return true

  return normalizedAllowedHosts.has(url.hostname.toLowerCase())
}

export const toAbsoluteSourceUrl = (value?: string, origin?: string): string => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed) || !origin) return trimmed

  try {
    return new URL(trimmed, origin).toString()
  } catch {
    return trimmed
  }
}

const normalizeSourceUrl = (value?: string, allowedHosts: string[] = []): string => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  if (/^\//.test(trimmed)) {
    try {
      const url = new URL(trimmed, 'https://placeholder.local')
      return `${url.pathname || '/'}${url.search || ''}`
    } catch {
      return ''
    }
  }
  if (!/^https?:\/\//i.test(trimmed)) return ''

  const url = parseAbsoluteUrl(trimmed)
  if (!url) return ''
  if (!isAllowedSourceUrl(trimmed, allowedHosts)) return ''
  return `${url.pathname || '/'}${url.search || ''}`
}

export default normalizeSourceUrl
