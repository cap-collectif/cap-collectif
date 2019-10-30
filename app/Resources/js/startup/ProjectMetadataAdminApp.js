// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { graphql, QueryRenderer } from 'react-relay';

import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProjectMetadataAdminPage from '../components/Admin/Project/ProjectMetadataAdminPage';
import type { ProjectMetadataAdminAppQueryResponse } from '~relay/ProjectMetadataAdminAppQuery.graphql';

const ProjectMetadataAdminApp = ({ projectId }: { projectId: string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectMetadataAdminAppQuery($projectId: ID!) {
            project: node(id: $projectId) {
              ...ProjectMetadataAdminForm_project
            }
          }
        `}
        variables={{
          projectId,
        }}
        render={({
          props,
          error,
        }: {
          ...ReactRelayReadyState,
          props: ?ProjectMetadataAdminAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            return <ProjectMetadataAdminPage project={props.project} />;
          }
          return null;
        }}
      />
    </IntlProvider>
  </Provider>
);

export default ProjectMetadataAdminApp;
