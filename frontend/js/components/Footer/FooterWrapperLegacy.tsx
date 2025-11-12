import * as React from 'react'
import { CookieClient, legacyCookieClient } from '@shared/utils/universalCookies'
import Footer, { Locale } from '@shared/footer/Footer'
import CookieManagerModal from '../StaticPage/CookieManagerModal'

interface Props {
  SSRData: {
    footer: any // Legacy
    locales: Locale[]
  }
}

export default ({ SSRData }: Props) => {
  const { footer, locales: queryLocales } = SSRData
  const cookies: CookieClient = legacyCookieClient()

  const locales = queryLocales.map(l => ({
    translationKey: l.translationKey,
    code: l.code,
  }))

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
        }),
      },
    ).then(() => {
      cookies.set('locale', language.code)
      window.location.reload()
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
    cookieManager: (
      <CookieManagerModal
        isLink
        separator={footer.legals.cookies || footer.legals.privacy || footer.legals.legal ? '|' : ''}
      />
    ),
  }

  return <Footer {...data} />
}
