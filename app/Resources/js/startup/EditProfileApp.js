// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import { EditProfileBox } from '../components/User/Profile/EditProfileBox';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <EditProfileBox {...props} />
    </IntlProvider>
  </Provider>
);
