import type { FC } from 'react'
import type { AppProps } from 'next/app'
import moment from 'moment'
import Providers from '../utils/providers'
import GlobalCSS from '../styles/GlobalCSS'
import Fonts from '../styles/Fonts'
import { getOnlyLanguage } from '@utils/locale-helper'
import { PageProps } from 'types'

// We use this component to only render when window is available (it's used by our Redux store)
const SafeHydrate: FC = ({ children }) => {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' || typeof document === 'undefined' ? null : children}
    </div>
  )
}

// This is the entrypoint where we inject all providers and shared data
function MyApp({ Component, pageProps }: AppProps<PageProps>) {
  if (pageProps.intl) moment.locale(getOnlyLanguage(pageProps.intl.locale))

  if (Object.keys(pageProps).length === 0) {
    return <Component {...pageProps} />
  }

  return (
    <SafeHydrate>
      <Providers
        featureFlags={pageProps.featureFlags}
        intl={pageProps.intl}
        viewerSession={pageProps.viewerSession}
        appVersion={pageProps.appVersion}
      >
        <GlobalCSS />
        <Fonts />
        <Component {...pageProps} />
      </Providers>
    </SafeHydrate>
  )
}

export default MyApp
