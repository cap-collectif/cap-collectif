'use client'
import { CapUIProvider, extendTheme, generateShades } from '@cap-collectif/ui'
import { AppProvider } from '@components/AppProvider/AppProvider'
import NoSSR from '@utils/NoSSR'
import getEnvironment from '@utils/relay-environement'
import { domAnimation, LazyMotion } from 'framer-motion'
import { FC, Suspense, useEffect } from 'react'
import { IntlProvider } from 'react-intl'
import { RelayEnvironmentProvider } from 'react-relay'
import { FeatureFlags, IntlType, ViewerSession } from 'types'
import MainLayout from './MainLayout'
import { useAppContext } from '@components/AppProvider/App.context'
import { GlobalFrontOfficeStyles } from './styles'
import { useCookies } from 'next-client-cookies'
import { GlobalTheme } from '@shared/navbar/NavBar.utils'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import { ADS_COOKIE, ANALYTICS_COOKIE } from '@shared/utils/cookies'
import { evalCustomCode, formatCustomCode } from './custom-code'

/**
 * Ce compo injecte tout ce qui est configurable à l'échelle globale d'une plateforme dans le BO, à savoir
 * les fonts, les couleurs de titres, le code personnalisé, les scripts ads/analytics.
 */
const UIProviderWithTheme: FC<{ SSRData: layoutQuery$data; children: React.ReactNode; captchaKey: string }> = ({
  children,
  SSRData,
  captchaKey,
}) => {
  const { fonts, customCode, analytics, ads } = SSRData
  const { siteColors } = useAppContext()
  const cookies = useCookies()
  const analyticConsentValue = cookies.get(ANALYTICS_COOKIE)
  const adCookieConsentValue = cookies.get(ADS_COOKIE)

  const executeAnalytics = analyticConsentValue === 'true' && analytics?.value
  const analyticsScript = formatCustomCode(analytics?.value)

  const executeAds = adCookieConsentValue === 'true' && ads?.value
  const adsScript = formatCustomCode(ads?.value)

  const bodyFont = fonts.find(f => f.useAsBody)
  const titleFont = fonts.find(f => f.useAsHeading)
  const customFonts = fonts.filter(f => f.isCustom)

  const cssForCustomFonts = customFonts.length
    ? customFonts.map(
        f => `@font-face {
            font-family: ${f.name};
            src: url("${f.file?.url}");
            font-style: normal;
            font-display: swap;
        }`,
      )
    : []

  const primary = generateShades(siteColors.primaryColor)

  const CapUITheme = extendTheme({
    colors: {
      primary,
      primaryHover: primary[800],
    },
    fonts: { body: `${bodyFont.name},system-ui,sans-serif`, heading: `${titleFont.name},system-ui,sans-serif` },
  })

  // @ts-expect-error TURNSTILE_PUBLIC_KEY doesn't exist on generic window type
  window.TURNSTILE_PUBLIC_KEY = captchaKey

  useEffect(() => {
    evalCustomCode(customCode?.value)
    if (executeAnalytics) evalCustomCode(analyticsScript)
    if (executeAds) evalCustomCode(adsScript)
  }, [customCode, executeAnalytics, analyticsScript, executeAds, adsScript])

  return (
    /** @ts-expect-error MAJ DS to make CapUIProvider have valid children props */
    <CapUIProvider theme={CapUITheme} resetCSS>
      <LazyMotion features={domAnimation}>
        {customCode?.value ? <div id="custom-code" dangerouslySetInnerHTML={{ __html: customCode?.value }} /> : null}
        {executeAnalytics ? <div id="analytics-code" dangerouslySetInnerHTML={{ __html: analyticsScript }} /> : null}
        {executeAds ? <div id="ads-code" dangerouslySetInnerHTML={{ __html: adsScript }} /> : null}
        <GlobalFrontOfficeStyles {...siteColors} />
        {cssForCustomFonts.length ? <style dangerouslySetInnerHTML={{ __html: cssForCustomFonts.join('\n') }} /> : null}
        {children}
      </LazyMotion>
    </CapUIProvider>
  )
}

export default function Providers({
  children,
  featureFlags,
  intl,
  appVersion,
  viewerSession,
  siteColors,
  SSRData,
  captchaKey,
}: Readonly<{
  children: React.ReactNode
  featureFlags: FeatureFlags
  intl: IntlType
  appVersion: string
  viewerSession: ViewerSession
  siteColors: GlobalTheme
  SSRData: layoutQuery$data
  captchaKey: string
}>) {
  return (
    // @ts-expect-error types inconsistencies between react-relay and relay-runtime
    <RelayEnvironmentProvider environment={getEnvironment(featureFlags)}>
      {/** @ts-expect-error MAJ react-intl */}
      <IntlProvider locale={intl.locale} messages={intl.messages}>
        <AppProvider viewerSession={viewerSession} appVersion={appVersion} siteColors={siteColors}>
          {/** Our first Suspense before our theme is loaded */}
          <Suspense fallback={null}>
            <NoSSR>
              <UIProviderWithTheme SSRData={SSRData} captchaKey={captchaKey}>
                <MainLayout SSRData={SSRData}>{children}</MainLayout>
              </UIProviderWithTheme>
            </NoSSR>
          </Suspense>
        </AppProvider>
      </IntlProvider>
    </RelayEnvironmentProvider>
  )
}
