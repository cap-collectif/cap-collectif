import type { ReactNode } from 'react'
import cookie from 'cookie'
import { IncomingMessage } from 'http'
import { Locale } from 'types'
import { setCookie } from 'nookies'

const LOCALE_COOKIE_NAME = 'locale'

export function getLocaleFromReq(req: IncomingMessage): Locale | undefined | null {
  const cookieHeader = req && req.headers && req.headers.cookie
  if (cookieHeader) {
    const cookies = cookie.parse(cookieHeader)
    return cookies[LOCALE_COOKIE_NAME] as Locale
  }

  return null
}

const getLocalePrefix = (localeCode: string): string => localeCode.split(/[-_]/)[0].toLowerCase()

const buildLegacyPathCandidates = (pathname: string, availableLocales: ReadonlyArray<string>): Set<string> => {
  const paths = new Set<string>(['/', '/admin-next'])
  const pathParts = pathname.split('/').filter(Boolean)

  for (let i = 1; i <= pathParts.length; i += 1) {
    paths.add(`/${pathParts.slice(0, i).join('/')}`)
  }

  availableLocales.forEach(localeCode => {
    paths.add(`/${getLocalePrefix(localeCode)}/admin-next`)
  })

  return paths
}

const buildLegacyDomainCandidates = (hostname: string): Set<string> => {
  const domains = new Set<string>(['.capco.dev'])
  if (hostname) {
    domains.add(hostname)
    domains.add(`.${hostname}`)
  }

  return domains
}

export function setLocaleCookie(locale: string, availableLocales: ReadonlyArray<string> = []): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const secureAttr = window.location.protocol === 'https:' ? '; secure' : ''
  const expired = 'Thu, 01 Jan 1970 00:00:00 GMT'
  const pathCandidates = buildLegacyPathCandidates(window.location.pathname, availableLocales)
  const domainCandidates = buildLegacyDomainCandidates(window.location.hostname)

  pathCandidates.forEach(path => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; expires=${expired}; path=${path}; samesite=strict${secureAttr}`

    domainCandidates.forEach(domain => {
      document.cookie = `${LOCALE_COOKIE_NAME}=; expires=${expired}; path=${path}; domain=${domain}; samesite=strict${secureAttr}`
    })
  })

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  setCookie(null, LOCALE_COOKIE_NAME, locale, {
    expires: expiresAt,
    path: '/',
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  })
}

// from fr-FR to FR_FR
export function formatLocaleToCode(locale: string): string {
  return locale.replace('-', '_').toUpperCase()
}

// from FR_FR to fr-FR
export function formatCodeToLocale(code: string): string {
  const codeSplitted = code.split('_')
  codeSplitted[0] = codeSplitted[0].toLowerCase()
  return codeSplitted.join('-')
}

export function getOnlyLanguage(locale: string) {
  switch (locale) {
    case 'en-GB':
    case 'eu-EU':
      return 'en-gb'
    case 'de-DE':
      return 'de'
    case 'es-ES':
      return 'es'
    case 'nl-NL':
      return 'nl'
    case 'sv-SE':
      return 'sv'
    case 'ur-IN':
      return 'ur'
    case 'fr-FR':
    case 'oc-OC':
    default:
      return 'fr'
  }
}

type Translation = {
  readonly locale: string
  readonly [field: string]: ReactNode
}

export type TranslateField = {
  name: string
  value: ReactNode
}

export function createOrReplaceTranslation(
  fields: TranslateField[],
  locale: string,
  translations: ReadonlyArray<Translation> | null,
): Translation[] {
  const translateAlreadyExist = translations?.some(translation => translation.locale === locale)
  const fieldsAdded = fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: field.value,
    }),
    {},
  )

  if (translateAlreadyExist) {
    // @ts-ignore
    return translations.map(translation => {
      if (translation.locale === locale) {
        return {
          locale,
          ...fieldsAdded,
        }
      }

      return translation
    })
  }
  if (translations) return [...translations, { locale, ...fieldsAdded }]
  return [{ locale, ...fieldsAdded }]
}
