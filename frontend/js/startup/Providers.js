// @flow
import * as React from 'react';
import * as Sentry from '@sentry/browser';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';

if (window.sentryDsn) {
  Sentry.init({ dsn: window.sentryDsn });
}

type Props = {| children: React.Node |};

class Providers extends React.Component<Props> {
  render() {
    const store = ReactOnRails.getStore('appStore');
    const { children } = this.props;

    if (window.sentryDsn) {
      Sentry.configureScope(function(scope) {
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
        <IntlProvider timeZone={window.timeZone}>{children}</IntlProvider>
      </Provider>
    );
  }
}

export default Providers;
