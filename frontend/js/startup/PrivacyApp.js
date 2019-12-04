// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import PrivacyModal from '../components/StaticPage/PrivacyModal';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <PrivacyModal {...props} />
    </IntlProvider>
  </Provider>
);
