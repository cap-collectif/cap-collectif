// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectContentAdminPage from '../components/Admin/Project/ProjectContentAdminPage';

export default () => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectContentAdminPage />
    </IntlProvider>
  </Provider>
);
