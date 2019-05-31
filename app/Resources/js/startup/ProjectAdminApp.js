// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import environment from '../createRelayEnvironment';
import ProjectContentAdminPage from '../components/Admin/Project/ProjectContentAdminPage';

const ProjectAdminPage = ({ projectId }: { projectId: string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectAdminAppQuery($projectId: ID!) {
            project: node(id: $projectId) {
              ... on Project {
                id
                title
                authors {
                  id
                }
                opinionTerm
                type {
                  id
                  title
                }
              }
            }
          }
        `}
        variables={{
          projectId,
        }}
        render={readyState => {
          if (readyState.props) {
            return <ProjectContentAdminPage project={readyState.props.project} />;
          }
          return null;
        }}
      />
    </IntlProvider>
  </Provider>
);

export default ProjectAdminPage;
