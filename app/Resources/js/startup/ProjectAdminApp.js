// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';

import IntlProvider from './IntlProvider';
import ProjectContentAdminPage from '../components/Admin/Project/ProjectContentAdminPage';

const ProjectAdminPage = ({ projectId }: { projectId: ?string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectContentAdminPage projectId={projectId} />
    </IntlProvider>
  </Provider>
);

export default ProjectAdminPage;
