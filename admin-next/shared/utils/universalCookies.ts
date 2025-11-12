'use client'

/* == Legacy functions to use cookies in a next component with twig == */
export interface CookieOptions {
  expires?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export interface CookieClient {
  get: (key: string) => string | undefined
  set: (key: string, value: string, options?: CookieOptions) => void
  delete: (key: string) => void
  isLegacy: () => boolean
}

const parseCookies = (): Record<string, string> => {
  return document.cookie
    .split('; ')
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, cookie) => {
      const [rawKey, ...rest] = cookie.split('=')
      const key = decodeURIComponent(rawKey)
      const value = decodeURIComponent(rest.join('='))
      acc[key] = value
      return acc
    }, {})
}

export const legacyCookieClient = (): CookieClient => {
  return {
    get: (key: string): string | undefined => {
      const cookies = parseCookies()
      return cookies[key]
    },

    set: (key: string, value: string, options: CookieOptions = {}): void => {
      let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`

      if (options.expires) {
        const date = new Date()
        date.setTime(date.getTime() + options.expires * 86400000)
        cookie += `; expires=${date.toUTCString()}`
      }

      cookie += `; path=${options.path || '/'}`

      if (options.domain) {
        cookie += `; domain=${options.domain}`
      }

      if (options.secure) {
        cookie += `; secure`
      }

      if (options.sameSite) {
        cookie += `; samesite=${options.sameSite}`
      }

      document.cookie = cookie
    },

    delete: (key: string): void => {
      document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    },
    isLegacy: (): boolean => true,
  }
}
