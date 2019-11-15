// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';

import environment, { graphqlError } from '../../../../createRelayEnvironment';
import ProjectAdminFormDeprecated from './ProjectAdminFormDeprecated';
import type { ProjectAdminPageDeprecatedQueryResponse } from '~relay/ProjectAdminPageDeprecatedQuery.graphql';

const ProjectAdminPageDeprecated = ({ projectId }: { projectId: ?string }) => (
  <QueryRenderer
    environment={environment}
    query={graphql`
      query ProjectAdminPageDeprecatedQuery($projectId: ID!, $isEditMode: Boolean!) {
        project: node(id: $projectId) @include(if: $isEditMode) {
          ...ProjectAdminFormDeprecated_project
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
      props: ?ProjectAdminPageDeprecatedQueryResponse,
    }) => {
      if (error) {
        return graphqlError;
      }
      if (props) {
        return <ProjectAdminFormDeprecated project={props.project || null} />;
      }
      return null;
    }}
  />
);

export default ProjectAdminPageDeprecated;
