// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { graphql, QueryRenderer } from 'react-relay';

import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProjectContentAdminPage from '../components/Admin/Project/ProjectContentAdminPage';
import type { ProjectAdminAppQueryResponse } from '~relay/ProjectAdminAppQuery.graphql';

const renderContentAdminForm = (projectId: ?string) =>
  projectId ? (
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
      render={({
        props,
        error,
      }: {
        ...ReactRelayReadyState,
        props: ?ProjectAdminAppQueryResponse,
      }) => {
        if (error) {
          return graphqlError;
        }
        if (props) {
          return <ProjectContentAdminPage isEditMode project={props.project} />;
        }
        return null;
      }}
    />
  ) : (
    <ProjectContentAdminPage project={null} isEditMode={false} />
  );

const ProjectAdminPage = ({ projectId }: { projectId: ?string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>{renderContentAdminForm(projectId)}</IntlProvider>
  </Provider>
);

export default ProjectAdminPage;
