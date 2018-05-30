import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProfileBox from '../components/User/Phone/ProfileBox';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProfileBox {...props} />
    </IntlProvider>
  </Provider>
);
