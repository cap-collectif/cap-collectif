// @ts-nocheck
import * as React from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import * as Sentry from '@sentry/browser'
import { ThemeProvider } from 'styled-components'
import { AnalyticsProvider } from 'use-analytics'
import { Provider as ReduxProvider } from 'react-redux'
import ReactOnRails from 'react-on-rails'
import { RelayEnvironmentProvider } from 'react-relay'
import { CapUIProvider, extendTheme, generatePalette } from '@cap-collectif/ui'
import IntlProvider from './IntlProvider'
import { theme } from '~/styles/theme'
import { analytics } from './analytics'
import environment from '../createRelayEnvironment'

const SENTRY_IGNORED_BROWSER_ERROR_MESSAGES = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
]

export const isMissingBrowserObjectUpdateRejection = (event: Record<string, any>): boolean =>
  event?.exception?.values?.some(
    ({ value }: { value?: string }) =>
      value?.includes('Object Not Found Matching Id:') && value.includes('MethodName:update, ParamCount:4'),
  ) ?? false

if (typeof window !== 'undefined' && window.sentryDsn) {
  Sentry.init({
    dsn: window.sentryDsn,
    ignoreErrors: SENTRY_IGNORED_BROWSER_ERROR_MESSAGES,
    beforeSend: event => (isMissingBrowserObjectUpdateRejection(event) ? null : event),
  })
}

type Props = {
  children: JSX.Element | JSX.Element[] | string
  unstable__AdminNextstore?: Record<string, any>
  designSystem?: boolean
  resetCSS?: boolean
  admin?: boolean
}

const Providers = ({ children, unstable__AdminNextstore, designSystem, resetCSS, admin = false }: Props) => {
  const store = unstable__AdminNextstore ?? ReactOnRails.getStore('appStore')
  analytics.ready(() => {
    const state = store && store.getState()

    if (state && state.user && state.user.user) {
      analytics.identify(state.user.user.id)
    }
  })
  const locale = typeof window !== 'undefined' ? window.locale : 'Unknown'
  const timeZone = typeof window !== 'undefined' ? window.timeZone : 'Unknown'

  if (typeof window !== 'undefined' && window.sentryDsn) {
    Sentry.configureScope(scope => {
      scope.setTag('request_locale', locale)
      scope.setTag('request_timezone', timeZone)

      if (store && store.user) {
        scope.setUser({
          id: store.user.id,
          email: store.user.email,
        })
      } else {
        scope.setUser({
          username: 'anon.',
        })
      }
    })
  }

  const Theme = designSystem ? CapUIProvider : ThemeProvider

  const state = store.getState()

  const CapUITheme = extendTheme(
    !admin
      ? {
          colors: {
            primary: generatePalette(state.default.parameters['color.btn.primary.bg']),
          },
          fonts: { body: 'inherit', heading: '' },
        }
      : {},
  )

  return (
    <ReduxProvider store={store}>
      <IntlProvider timeZone={timeZone}>
        <RelayEnvironmentProvider environment={environment}>
          <AnalyticsProvider instance={analytics}>
            {/** @ts-expect-error resetCSS props is only temporary */}
            <Theme theme={designSystem ? CapUITheme : theme} resetCSS={designSystem ? resetCSS : undefined}>
              <LazyMotion features={domAnimation}>{children}</LazyMotion>
            </Theme>
          </AnalyticsProvider>
        </RelayEnvironmentProvider>
      </IntlProvider>
    </ReduxProvider>
  )
}

export default Providers
