// @flow
import * as React from 'react';
import { MotionConfig, AnimationFeature, ExitFeature } from 'framer-motion';
import * as Sentry from '@sentry/browser';
import { ThemeProvider } from 'styled-components';
import { AnalyticsProvider } from 'use-analytics';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { RelayEnvironmentProvider } from 'react-relay';
import IntlProvider from './IntlProvider';
import { theme } from '~/styles/theme';
import { analytics } from './analytics';
import environment from '../createRelayEnvironment';

if (window.sentryDsn) {
  Sentry.init({ dsn: window.sentryDsn });
}

type Props = {| children: React.Node |};

class Providers extends React.Component<Props> {
  render() {
    const store = ReactOnRails.getStore('appStore');
    const { children } = this.props;

    if (window.sentryDsn) {
      Sentry.configureScope(scope => {
        scope.setTag('request_locale', window.locale);
        scope.setTag('request_timezone', window.timeZone);

        if (store.user) {
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

    return (
      <Provider store={store}>
        <IntlProvider timeZone={window.timeZone}>
          <RelayEnvironmentProvider environment={environment}>
            <ThemeProvider theme={theme}>
              <AnalyticsProvider instance={analytics}>
                <MotionConfig features={[AnimationFeature, ExitFeature]}>{children}</MotionConfig>{' '}
              </AnalyticsProvider>
            </ThemeProvider>
          </RelayEnvironmentProvider>
        </IntlProvider>
      </Provider>
    );
  }
}

export default Providers;
