// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import OpinionPage, { type Props } from '../components/Opinion/OpinionPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <OpinionPage {...props} />
    </IntlProvider>
  </Provider>
);
