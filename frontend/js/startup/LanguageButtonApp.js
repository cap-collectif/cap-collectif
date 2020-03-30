// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import { LanguageRedirectButton } from "~/components/LanguageButton/LanguageRedirectButton";
import type { Props } from "~/components/LanguageButton/LanguageRedirectButton";

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <LanguageRedirectButton {...props} />
    </IntlProvider>
  </Provider>
);
