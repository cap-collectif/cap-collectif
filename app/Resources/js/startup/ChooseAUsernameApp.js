// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ChooseAUsernameModal from '../components/User/Profile/ChooseAUsernameModal';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ChooseAUsernameModal {...props} />
    </IntlProvider>
  </Provider>
);
