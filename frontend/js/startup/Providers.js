// @flow
import * as React from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import * as Sentry from '@sentry/browser';
import { ThemeProvider } from 'styled-components';
import { AnalyticsProvider } from 'use-analytics';
import { Provider as ReduxProvider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { RelayEnvironmentProvider } from 'react-relay';
import { CapUIProvider } from '@cap-collectif/ui';
import IntlProvider from './IntlProvider';
import { theme } from '~/styles/theme';
import { analytics } from './analytics';
import environment from '../createRelayEnvironment';

if (typeof window !== 'undefined' && window.sentryDsn) {
  Sentry.init({ dsn: window.sentryDsn });
}

type Props = {|
  children: React.Node,
  unstable__AdminNextstore?: Object,
  designSystem?: boolean,
  resetCSS?: boolean,
|};

const Providers = ({ children, unstable__AdminNextstore, designSystem, resetCSS }: Props) => {
  const store = unstable__AdminNextstore ?? ReactOnRails.getStore('appStore');
  analytics.ready(() => {
    const state = store && store.getState();
    if (state && state.user && state.user.user) {
      analytics.identify(state.user.user.id);
    }
  });

  const locale = typeof window !== 'undefined' ? window.locale : 'Unknown';
  const timeZone = typeof window !== 'undefined' ? window.timeZone : 'Unknown';

  if (typeof window !== 'undefined' && window.sentryDsn) {
    Sentry.configureScope(scope => {
      scope.setTag('request_locale', locale);
      scope.setTag('request_timezone', timeZone);

      if (store && store.user) {
        scope.setUser({
          id: store.user.id,
          email: store.user.email,
        });
      } else {
        scope.setUser({
          username: 'anon.',
        });
      }
    });
  }
  const Theme = designSystem ? CapUIProvider : ThemeProvider;

  return (
    <ReduxProvider store={store}>
      <IntlProvider timeZone={timeZone}>
        <RelayEnvironmentProvider environment={environment}>
          <AnalyticsProvider instance={analytics}>
            {/** $FlowFixMe resetCSS props is only temporary */}
            <Theme
              theme={designSystem ? undefined : theme}
              resetCSS={designSystem ? resetCSS : undefined}>
              <LazyMotion features={domAnimation}>{children}</LazyMotion>
            </Theme>
          </AnalyticsProvider>
        </RelayEnvironmentProvider>
      </IntlProvider>
    </ReduxProvider>
  );
};

export default Providers;
