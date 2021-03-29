// @flow
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl-redux';
import { theme } from '~/styles/theme';
import appStore from '~/stores/AppStore';

type Props = {| +children: React.Node, +store: any |};

const MockProviders = ({ children, store }: Props) => {
  return (
    <Provider store={appStore(store)}>
      <IntlProvider>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </IntlProvider>
    </Provider>
  );
};

export default MockProviders;
