// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { graphql, QueryRenderer } from 'react-relay';

import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProjectExternalProjectAdminPage from '~/components/Admin/Project/External/ProjectExternalProjectAdminPage';
import type { ProjectExternalProjectAdminAppQueryResponse } from '~relay/ProjectExternalProjectAdminAppQuery.graphql';

const ProjectExternalProjectAdminApp = ({
  projectId,
  hostUrl,
}: {
  projectId: ?string,
  hostUrl: string,
}) => {
  return (
    <Provider store={ReactOnRails.getStore('appStore')}>
      <IntlProvider>
        {projectId ? (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query ProjectExternalProjectAdminAppQuery($projectId: ID!) {
                project: node(id: $projectId) {
                  ...ProjectExternalProjectAdminForm_project
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
              props: ?ProjectExternalProjectAdminAppQueryResponse,
            }) => {
              if (error) {
                return graphqlError;
              }
              if (props) {
                return (
                  <ProjectExternalProjectAdminPage project={props.project} hostUrl={hostUrl} />
                );
              }
              return null;
            }}
          />
        ) : (
          <ProjectExternalProjectAdminPage project={null} />
        )}
      </IntlProvider>
    </Provider>
  );
};

export default ProjectExternalProjectAdminApp;
