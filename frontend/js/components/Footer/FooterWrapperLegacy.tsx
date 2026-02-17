import * as React from 'react'
import { CookieClient, legacyCookieClient } from '@shared/utils/universalCookies'
import Footer, { Locale } from '@shared/footer/Footer'
import CookieManagerModal from '../StaticPage/CookieManagerModal'
import CookieMonster from '@shared/utils/CookieMonster'

interface Props {
  SSRData: {
    footer: any // Legacy
    locales: Locale[]
  }
}

const getLocalePrefix = (localeCode: string): string => localeCode.split(/[-_]/)[0].toLowerCase()

export const getPrefixedPath = (localeCode: string, pathname: string, localeCodes: string[]): string => {
  const prefixes = new Set(localeCodes.map(getLocalePrefix))
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] && prefixes.has(parts[0])) {
    parts.shift()
  }

  const basePath = parts.length ? `/${parts.join('/')}` : '/'
  const prefix = getLocalePrefix(localeCode)

  return basePath === '/' ? `/${prefix}/` : `/${prefix}${basePath}`
}

export default ({ SSRData }: Props) => {
  const { footer, locales: queryLocales } = SSRData
  const cookies: CookieClient = legacyCookieClient()

  const locales = queryLocales.map(l => ({
    translationKey: l.translationKey,
    code: l.code,
  }))
  const localeCodes = locales.map(l => l.code)

  const onLanguageChange = async language => {
    return fetch(
      `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}//${
        typeof window !== 'undefined' ? window.location.host : 'Unknown'
      }/api` + `/change-locale/${language.code}`,
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeName: null,
          routeParams: [],
          currentPath: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        }),
      },
    )
      .then(response => response.json())
      .then(({ path }) => {
        CookieMonster.setLocale(language.code)
        window.location.href = path
      })
      .catch(() => {
        const nextPath = getPrefixedPath(language.code, window.location.pathname, localeCodes)
        window.location.href = `${nextPath}${window.location.search}${window.location.hash}`
      })
  }

  /* @ts-ignore in legacy mode, defaultLocale is passed in SSRData */
  const defaultLocale = locales.find(e => e.code == SSRData.defaultLocale)
  const defaultLanguage = defaultLocale
    ? {
        code: defaultLocale.code,
        translationKey: defaultLocale.translationKey,
      }
    : {
        code: 'fr-FR',
        translationKey: 'french',
      }

  const data = {
    footer,
    cookies,
    locales,
    onLanguageChange,
    defaultLanguage,
    cookieManager: <CookieManagerModal isLink color={footer.textColor} />,
  }

  return <Footer {...data} />
}
