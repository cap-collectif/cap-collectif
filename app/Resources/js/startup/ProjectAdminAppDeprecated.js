// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';

import IntlProvider from './IntlProvider';
import ProjectAdminPageDeprecated from '../components/Admin/Project/Deprecated/ProjectAdminPageDeprecated';

const ProjectAdminAppDeprecated = ({ projectId }: { projectId: ?string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectAdminPageDeprecated projectId={projectId} />
    </IntlProvider>
  </Provider>
);

export default ProjectAdminAppDeprecated;
