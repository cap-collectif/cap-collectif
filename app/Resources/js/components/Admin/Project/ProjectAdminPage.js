// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';

import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProjectAdminForm from './Form/ProjectAdminForm';
import type { ProjectAdminPageQueryResponse } from '~relay/ProjectAdminPageQuery.graphql';

const ProjectAdminPage = ({ projectId }: { projectId: ?string }) => (
  <QueryRenderer
    environment={environment}
    query={graphql`
      query ProjectAdminPageQuery($projectId: ID!, $isEditMode: Boolean!) {
        project: node(id: $projectId) @include(if: $isEditMode) {
          ...ProjectContentAdminForm_project
        }
      }
    `}
    variables={{
      projectId: projectId || '',
      isEditMode: !!projectId,
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
        return <ProjectAdminForm isEditMode project={props.project} />;
      }
      return null;
    }}
  />
);

export default ProjectAdminPage;
