// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import type { Props } from '../components/Source/SourcePage';
import SourcePage from '../components/Source/SourcePage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SourcePage {...props} />
    </IntlProvider>
  </Provider>
);
