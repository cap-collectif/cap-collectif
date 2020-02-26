// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';

import environment, { graphqlError } from '~/createRelayEnvironment';
import ProjectAdminContent from './ProjectAdminContent';
import type { ProjectAdminPageQueryResponse } from '~relay/ProjectAdminPageQuery.graphql';
import { PROJECT_ADMIN_PROPOSAL_PAGINATION } from '~/components/Admin/Project/ProjectAdminProposals';

const ProjectAdminPage = ({ projectId }: { projectId: ?string }) => (
  <QueryRenderer
    environment={environment}
    query={graphql`
      query ProjectAdminPageQuery(
        $projectId: ID!
        $isEditMode: Boolean!
        $count: Int!
        $cursor: String
      ) {
        project: node(id: $projectId) @include(if: $isEditMode) {
          ...ProjectAdminContent_project
            @arguments(projectId: $projectId, count: $count, cursor: $cursor)
        }
      }
    `}
    variables={{
      count: PROJECT_ADMIN_PROPOSAL_PAGINATION,
      cursor: null,
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
        return <ProjectAdminContent project={props.project || null} />;
      }
      return null;
    }}
  />
);

export default ProjectAdminPage;
