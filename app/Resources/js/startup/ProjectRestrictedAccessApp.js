// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProjectRestrictedAccess from '../components/Project/Page/ProjectRestrictedAccess';

export default (props: { projectId: string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectRestrictedAccess {...props} />
    </IntlProvider>
  </Provider>
);
