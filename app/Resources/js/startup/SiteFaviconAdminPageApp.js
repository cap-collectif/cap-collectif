import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SiteFaviconAdminPage from '../components/Admin/SiteFavicon/SiteFaviconAdminPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SiteFaviconAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
