// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';

import IntlProvider from './IntlProvider';
import ProjectAdminPage from '../components/Admin/Project/ProjectAdminPage';
import { ProjectAdminProposalsProvider } from '~/components/Admin/Project/ProjectAdminPage.context';
import AlertBoxApp from '~/startup/AlertBoxApp';

type ProjectAdminAppProps = {|
  +projectId: ?string,
  +firstCollectStepId: ?string,
|};

const ProjectAdminApp = ({ projectId, firstCollectStepId }: ProjectAdminAppProps) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectAdminProposalsProvider firstCollectStepId={firstCollectStepId}>
        <AlertBoxApp />
        <ProjectAdminPage projectId={projectId} />
      </ProjectAdminProposalsProvider>
    </IntlProvider>
  </Provider>
);

export default ProjectAdminApp;
