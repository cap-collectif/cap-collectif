import { cookies, headers } from 'next/headers'
import { Locale } from 'types'

const SUPPORTED_LOCALES = new Set<string>(Object.values(Locale))

export const resolveRequestLocale = (headerLocale?: string | null, cookieLocale?: string | null): Locale => {
  if (headerLocale && SUPPORTED_LOCALES.has(headerLocale)) {
    return headerLocale as Locale
  }

  if (cookieLocale && SUPPORTED_LOCALES.has(cookieLocale)) {
    return cookieLocale as Locale
  }

  return Locale.frFR
}

export const getRequestLocale = (): Locale => {
  const headerStore = headers()
  const cookieStore = cookies()

  return resolveRequestLocale(headerStore.get('x-capco-locale'), cookieStore.get('locale')?.value)
}
