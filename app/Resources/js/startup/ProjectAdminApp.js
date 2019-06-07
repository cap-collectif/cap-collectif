// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { graphql, QueryRenderer } from 'react-relay';

import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProjectContentAdminPage from '../components/Admin/Project/ProjectContentAdminPage';

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
        render={({ props, error }) => {
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
