// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectRestrictedAccessAlert from '../components/Project/Page/ProjectRestrictedAccessAlert';

export default (props: { projectId: string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectRestrictedAccessAlert {...props} />
    </IntlProvider>
  </Provider>
);
