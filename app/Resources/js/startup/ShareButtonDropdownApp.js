import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ShareButtonDropdown from '../components/Utils/ShareButtonDropdown';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ShareButtonDropdown {...props} />
    </IntlProvider>
  </Provider>
);
