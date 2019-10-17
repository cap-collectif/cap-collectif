// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';

import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProjectContentAdminPageView from './ProjectAdminPageView';
import type { ProjectAdminPageQueryResponse } from '~relay/ProjectAdminPageQuery.graphql';

const ProjectAdminPage = ({ projectId }: { projectId: ?string }) =>
  projectId ? (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ProjectAdminPageQuery($projectId: ID!) {
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
        props: ?ProjectAdminPageQueryResponse,
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

export default ProjectAdminPage;
