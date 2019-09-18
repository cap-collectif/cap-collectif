// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import OpinionVersionListPage from '../components/OpinionVersion/OpinionVersionListPage';
import type { Props } from '../components/OpinionVersion/OpinionVersionListPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <OpinionVersionListPage {...props} />
    </IntlProvider>
  </Provider>
);
