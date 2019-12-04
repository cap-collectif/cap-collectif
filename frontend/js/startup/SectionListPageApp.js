// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SectionListPage from '../components/Section/SectionListPage';
import type { Props } from '../components/Section/SectionListPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SectionListPage {...props} />
    </IntlProvider>
  </Provider>
);
