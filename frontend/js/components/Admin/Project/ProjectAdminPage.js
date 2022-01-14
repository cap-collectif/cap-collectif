// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { useSelector } from 'react-redux';
import environment, { graphqlError } from '~/createRelayEnvironment';
import ProjectAdminContent from './ProjectAdminContent';
import type { ProjectAdminPageQueryResponse } from '~relay/ProjectAdminPageQuery.graphql';
import type { GlobalState } from '~/types';

type Props = {|
  +projectId: ?string,
  +firstCollectStepId: ?string,
|};

export const ProjectAdminPage = ({ projectId, firstCollectStepId }: Props) => {
  const { user } = useSelector((state: GlobalState) => state.user);
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ProjectAdminPageQuery($projectId: ID!, $isEditMode: Boolean!, $isAdmin: Boolean!) {
          project: node(id: $projectId) @include(if: $isEditMode) {
            ...ProjectAdminContent_project @arguments(projectId: $projectId)
          }
          ...ProjectAdminContent_query
          viewer @include(if: $isAdmin) {
            userIdentificationCodeLists {
              totalCount
            }
          }
        }
      `}
      variables={{
        projectId: projectId || '',
        isEditMode: !!projectId,
        isAdmin: user?.isAdmin,
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
          const hasIdentificationCodeLists =
            props.viewer && props.viewer.userIdentificationCodeLists.totalCount > 0;
          return (
            <ProjectAdminContent
              project={props.project || null}
              query={props || null}
              firstCollectStepId={firstCollectStepId}
              hasIdentificationCodeLists={hasIdentificationCodeLists}
            />
          );
        }
        return null;
      }}
    />
  );
};

export default ProjectAdminPage;
