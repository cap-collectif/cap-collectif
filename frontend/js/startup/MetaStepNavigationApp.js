// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import MetaStepNavigationBox, { type Props } from '../components/Steps/MetaStepNavigationBox';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider timeZone={window.timeZone}>
      <MetaStepNavigationBox {...props} />
    </IntlProvider>
  </Provider>
);
