// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectCreateButton from '../components/Admin/Project/ProjectCreateButton';

export default () => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectCreateButton />
    </IntlProvider>
  </Provider>
);
