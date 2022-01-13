// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import ProjectAdminContent from './ProjectAdminContent';
import type { ProjectAdminPageQueryResponse } from '~relay/ProjectAdminPageQuery.graphql';

type Props = {|
  +projectId: ?string,
  +firstCollectStepId: ?string,
|};

export const ProjectAdminPage = ({ projectId, firstCollectStepId }: Props) => {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ProjectAdminPageQuery($projectId: ID!, $isEditMode: Boolean!) {
          project: node(id: $projectId) @include(if: $isEditMode) {
            ...ProjectAdminContent_project @arguments(projectId: $projectId)
          }
          ...ProjectAdminContent_query
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
          return (
            <ProjectAdminContent
              project={props.project || null}
              query={props || null}
              firstCollectStepId={firstCollectStepId}
            />
          );
        }
        return null;
      }}
    />
  );
};

export default ProjectAdminPage;
