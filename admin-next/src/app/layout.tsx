/* eslint-disable relay/must-colocate-fragment-spreads */
/* eslint-disable relay/unused-fields */
import Providers from './Providers'
import getFeatureFlags from '@utils/feature-flags-resolver'
import { IntlType, Locale } from 'types'
import { __isTest__ } from 'config'
import { messages } from '@utils/withPageAuthRequired'
import { cookies } from 'next/headers'
import getSessionFromSessionCookie from '@utils/session-resolver'
import getViewerJsonFromRedisSession from '@utils/session-decoder'
import { CookiesProvider } from 'next-client-cookies/server'
import { getTheme } from '@shared/navbar/NavBar.utils'
import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import { formatCookiesForServer } from '@shared/utils/cookies'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export const layoutQuery = graphql`
  query layoutQuery {
    siteColors {
      keyname
      value
    }
    favicon: siteImage(keyname: "favicon") {
      media {
        url(format: "relative")
      }
    }
    fonts(splitFontsFromSameFile: true) {
      name
      useAsBody
      useAsHeading
      isCustom
      weight
      style
      file {
        url(format: "relative")
      }
    }
    customCode: siteParameter(keyname: "global.site.embed_js") {
      value
    }
    analytics: siteParameter(keyname: "snalytical-tracking-scripts-on-all-pages") {
      value
    }
    ads: siteParameter(keyname: "ad-scripts-on-all-pages") {
      value
    }
    cookiesList: siteParameter(keyname: "cookies-list") {
      value
    }
    shieldIntroduction: siteParameter(keyname: "shield.introduction") {
      value
    }
    locales {
      isDefault
      isEnabled
      isPublished
      code
      traductionKey
    }
    shieldImage: siteImage(keyname: "image.shield") {
      media {
        url(format: "relative")
      }
    }
    logo: siteImage(keyname: "image.logo") {
      media {
        url(format: "relative")
        width
        height
      }
    }
    menuItems {
      title
      href: link
      children {
        title
        href: link
      }
    }
    footer {
      socialNetworks {
        title
        link
        style
      }
      links {
        name
        url
      }
      legals {
        cookies
        privacy
        legal
      }
      cookiesPath
      legalPath
      privacyPath
    }
    footerTitle: siteParameter(keyname: "footer.text.title") {
      value
    }
    footerBody: siteParameter(keyname: "footer.text.body") {
      value
    }
    mapToken(provider: MAPBOX) {
      publicToken
      styleId
      styleOwner
    }
    ...ChartModal_query
    ...RegistrationModal_query
  }
`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  let sessionCookie = cookieStore.get('PHPSESSID')
  let redisSession = null
  let viewerSession = null
  if (sessionCookie) {
    redisSession = await getSessionFromSessionCookie(sessionCookie.value)
    if (redisSession) viewerSession = getViewerJsonFromRedisSession(redisSession)
  }

  const featureFlags = await getFeatureFlags()
  const locale = cookieStore.get('locale')?.value

  const intl: IntlType = {
    locale: (locale as Locale) || Locale.frFR,
    messages: __isTest__ ? {} : messages[locale] || messages[Locale.frFR],
  }

  const SSRData = await Fetcher.ssrGraphql<layoutQuery$data>(layoutQuery, null, formatCookiesForServer(cookieStore))

  if (!SSRData) throw new Error('Something went wrong')

  const siteColors = getTheme(SSRData.siteColors)

  const favicon = SSRData.favicon

  const appVersion = process.env.SYMFONY_APP_VERSION || 'dev'

  const captchaKey = process.env.SYMFONY_TURNSTILE_PUBLIC_KEY

  return (
    <html lang={locale || 'fr'} style={{ fontSize: 14 }}>
      {favicon?.media?.url ? <link rel="icon" href={favicon?.media?.url} sizes="any" /> : null}
      <body>
        <CookiesProvider>
          <Providers
            featureFlags={featureFlags}
            intl={intl}
            appVersion={appVersion}
            viewerSession={viewerSession}
            siteColors={siteColors}
            SSRData={SSRData}
            captchaKey={captchaKey}
          >
            <NuqsAdapter>{children}</NuqsAdapter>
          </Providers>
        </CookiesProvider>
      </body>
    </html>
  )
}
