// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';

import IntlProvider from './IntlProvider';
import ProjectAdminPage from '../components/Admin/Project/ProjectAdminPage';

const ProjectAdminApp = ({ projectId }: { projectId: ?string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectAdminPage projectId={projectId} />
    </IntlProvider>
  </Provider>
);

export default ProjectAdminApp;
