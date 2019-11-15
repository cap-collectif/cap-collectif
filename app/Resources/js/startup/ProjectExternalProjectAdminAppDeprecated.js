// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { graphql, QueryRenderer } from 'react-relay';

import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProjectExternalProjectAdminPageDeprecated from '~/components/Admin/Project/External/ProjectExternalProjectAdminPageDeprecated';
import type { ProjectExternalProjectAdminAppDeprecatedQueryResponse } from '~relay/ProjectExternalProjectAdminAppDeprecatedQuery.graphql';

const ProjectExternalProjectAdminAppDeprecated = ({
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
              query ProjectExternalProjectAdminAppDeprecatedQuery($projectId: ID!) {
                project: node(id: $projectId) {
                  ...ProjectExternalAdminFormDeprecated_project
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
              props: ?ProjectExternalProjectAdminAppDeprecatedQueryResponse,
            }) => {
              if (error) {
                return graphqlError;
              }
              if (props) {
                return (
                  <ProjectExternalProjectAdminPageDeprecated
                    project={props.project}
                    hostUrl={hostUrl}
                  />
                );
              }
              return null;
            }}
          />
        ) : (
          <ProjectExternalProjectAdminPageDeprecated project={null} />
        )}
      </IntlProvider>
    </Provider>
  );
};

export default ProjectExternalProjectAdminAppDeprecated;
