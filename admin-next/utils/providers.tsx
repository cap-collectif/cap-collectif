// This is similar to `frontend/js/startup/Providers.js` but with less deps
import React from 'react'
import { RelayEnvironmentProvider } from 'react-relay'
import { IntlProvider } from 'react-intl'
import { CapUIProvider } from '@cap-collectif/ui'
import { FeatureFlags, IntlType, ViewerSession } from '../types'
import getEnvironment from './relay-environement'
import { AppProvider } from '../components/AppProvider/AppProvider'
import { LazyMotion, domAnimation } from 'framer-motion'
import NoSSR from './NoSSR'
import { GlobalTheme } from '@shared/navbar/NavBar.utils'

type ProvidersProps = {
  featureFlags: FeatureFlags
  intl: IntlType
  viewerSession: ViewerSession
  appVersion: string
  children?: React.ReactNode
  siteColors?: GlobalTheme
}

const Providers: React.FC<ProvidersProps> = ({
  children,
  intl,
  featureFlags,
  viewerSession,
  appVersion,
  siteColors,
}) => {
  return (
    // @ts-expect-error types inconsistencies between react-relay and relay-runtime
    <RelayEnvironmentProvider environment={getEnvironment(featureFlags)}>
      {/** @ts-expect-error MAJ react-intl */}
      <IntlProvider locale={intl.locale} messages={intl.messages}>
        <NoSSR>
          {/** @ts-expect-error MAJ DS to make CapUIProvider have valid children props */}
          <CapUIProvider>
            <AppProvider viewerSession={viewerSession} appVersion={appVersion} siteColors={siteColors}>
              <LazyMotion features={domAnimation}>{children}</LazyMotion>
            </AppProvider>
          </CapUIProvider>
        </NoSSR>
      </IntlProvider>
    </RelayEnvironmentProvider>
  )
}

export default Providers
