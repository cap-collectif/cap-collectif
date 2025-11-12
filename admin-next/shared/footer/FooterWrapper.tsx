import * as React from 'react'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import Footer, { Locale } from '@shared/footer/Footer'
import Fetcher from '@utils/fetch'
import { useCookies } from 'next-client-cookies'
import CookieManager from '@components/FrontOffice/Cookies/CookieManager'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'

interface Props {
  SSRData: layoutQuery$data
}

export default ({ SSRData }: Props) => {
  const { footer, footerTitle, footerBody, locales: queryLocales } = SSRData

  const cookies = useCookies()
  const { siteColors } = useAppContext()
  const locales = queryLocales
    .filter(l => l.isEnabled && l.isPublished)
    .map(l => ({ translationKey: l.traductionKey, code: l.code }))

  const onLanguageChange = (language: Locale) => {
    Fetcher.postToJson(`/change-locale/${language.code}`, {
      // @ts-ignore the controller needs those params
      routeName: null,
      routeParams: [],
    }).then(() => {
      cookies.set('locale', language.code)
      window.location.reload()
    })
  }

  const defaultLocale = queryLocales.find(e => e.isDefault)
  const defaultLanguage = { code: defaultLocale.code, translationKey: defaultLocale.traductionKey }

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
