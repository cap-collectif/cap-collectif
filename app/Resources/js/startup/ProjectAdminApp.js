// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { graphql, QueryRenderer, type ReadyState } from 'react-relay';

import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProjectContentAdminPage from '../components/Admin/Project/ProjectContentAdminPage';
import type { ProjectAdminAppQueryResponse } from '~relay/ProjectAdminAppQuery.graphql';

const ProjectAdminPage = ({ projectId }: { projectId: string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectAdminAppQuery($projectId: ID!) {
            project: node(id: $projectId) {
              ...ProjectContentAdminForm_project
            }
          }
        `}
        variables={{
          projectId,
        }}
        render={({ props, error }: { props: ?ProjectAdminAppQueryResponse, ...ReadyState }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            return <ProjectContentAdminPage project={props.project} />;
          }
        }}
      />
    </IntlProvider>
  </Provider>
);

export default ProjectAdminPage;
