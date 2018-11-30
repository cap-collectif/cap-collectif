// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProjectDistrictAdminPage from '../components/ProjectDistrict/ProjectDistrictAdminPage';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectDistrictAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
