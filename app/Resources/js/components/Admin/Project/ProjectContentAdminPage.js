// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';

import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProjectContentAdminPageView from './ProjectContentAdminPageView';
import type { ProjectContentAdminPageQueryResponse } from '~relay/ProjectContentAdminPageQuery.graphql';

const ProjectContentAdminPage = ({ projectId }: { projectId: ?string }) =>
  projectId ? (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ProjectContentAdminPageQuery($projectId: ID!) {
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
        props: ?ProjectContentAdminPageQueryResponse,
      }) => {
        if (error) {
          return graphqlError;
        }
        if (props) {
          return <ProjectContentAdminPageView isEditMode project={props.project} />;
        }
        return null;
      }}
    />
  ) : (
    <ProjectContentAdminPageView project={null} isEditMode={false} />
  );

export default ProjectContentAdminPage;
