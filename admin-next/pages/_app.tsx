import { getOnlyLanguage } from '@utils/locale-helper'
import Providers from '@utils/providers'
import moment from 'moment'
import type { AppProps } from 'next/app'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'
import type { FC } from 'react'
import { PageProps } from 'types'
import GlobalCSS from '../styles/GlobalCSS'

// We use this component to only render when window is available (it's used by our Redux store)
const SafeHydrate: FC<{ children?: React.ReactNode }> = ({ children }) => {
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
    <NuqsAdapter>
      <SafeHydrate>
        <Providers
          featureFlags={pageProps.featureFlags}
          intl={pageProps.intl}
          viewerSession={pageProps.viewerSession}
          appVersion={pageProps.appVersion}
        >
          <GlobalCSS />
          <Component {...pageProps} />
        </Providers>
      </SafeHydrate>
    </NuqsAdapter>
  )
}

export default MyApp
