import * as React from 'react'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import Footer, { Locale } from '@shared/footer/Footer'
import Fetcher from '@utils/fetch'
import { useCookies } from 'next-client-cookies'
import CookieManager from '@components/FrontOffice/Cookies/CookieManager'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { formatCodeToLocale, setLocaleCookie } from '@utils/locale-helper'

interface Props {
  SSRData: layoutQuery$data
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
  const { footer, footerTitle, footerBody, locales: queryLocales } = SSRData

  const cookies = useCookies()
  const { siteColors } = useAppContext()
  const locales = queryLocales
    .filter(l => l.isEnabled && l.isPublished)
    .map(l => ({ translationKey: l.traductionKey, code: formatCodeToLocale(l.code) }))
  const localeCodes = locales.map(l => l.code)

  const stripLocalePrefix = (pathname: string): string => {
    const prefixes = new Set(locales.map(l => getLocalePrefix(l.code)))
    const parts = pathname.split('/').filter(Boolean)
    if (parts[0] && prefixes.has(parts[0])) {
      parts.shift()
    }

    return parts.length ? `/${parts.join('/')}` : '/'
  }

  const buildTargetPath = (localeCode: string): string => {
    const normalizedPath = stripLocalePrefix(window.location.pathname)

    if (normalizedPath === '/admin-next' || normalizedPath.startsWith('/admin-next/')) {
      return `${normalizedPath}${window.location.search}${window.location.hash}`
    }

    const nextPath = getPrefixedPath(localeCode, window.location.pathname, localeCodes)
    return `${nextPath}${window.location.search}${window.location.hash}`
  }

  const navigateWithReload = (targetPath: string): void => {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (targetPath === currentPath) {
      window.location.reload()
      return
    }

    window.location.href = targetPath
  }

  const persistLocaleCookie = (localeCode: string): void => {
    setLocaleCookie(
      localeCode,
      locales.map(locale => locale.code),
    )
  }

  const navigateAfterCookieWrite = (targetPath: string): void => {
    window.setTimeout(() => {
      navigateWithReload(targetPath)
    }, 0)
  }

  const onLanguageChange = (language: Locale) => {
    Fetcher.postToJson(`/change-locale/${language.code}`, {
      // @ts-ignore the controller needs those params
      routeName: null,
      routeParams: [],
      currentPath: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    })
      .then(() => {
        persistLocaleCookie(language.code)
        navigateAfterCookieWrite(buildTargetPath(language.code))
      })
      .catch(() => {
        persistLocaleCookie(language.code)
        navigateAfterCookieWrite(buildTargetPath(language.code))
      })
  }

  const defaultLocale = queryLocales.find(e => e.isDefault)
  const defaultLanguage = { code: formatCodeToLocale(defaultLocale.code), translationKey: defaultLocale.traductionKey }

  const data = {
    footer: {
      ...footer,
      textTitle: footerTitle,
      textBody: footerBody,
      textColor: siteColors.footerTextColor,
      backgroundColor: siteColors.footerBackgroundColor,
    },
    cookies,
    locales,
    onLanguageChange,
    defaultLanguage,
    cookieManager: <CookieManager mode="LINK" SSRData={SSRData} display="inline" />,
  }

  return <Footer {...data} />
}
