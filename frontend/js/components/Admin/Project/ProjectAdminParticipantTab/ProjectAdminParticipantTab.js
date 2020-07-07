// @flow
import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { graphql, usePreloadedQuery, useQuery } from 'relay-hooks';
import ReactPlaceholder from 'react-placeholder';
import type { ResultPreloadQuery, Query } from '~/types';
import type {
  ProjectAdminParticipantTabQueryResponse,
  ProjectAdminParticipantTabQueryVariables,
} from '~relay/ProjectAdminParticipantTabQuery.graphql';
import type { ProjectAdminParticipantParameters } from './ProjectAdminParticipant.reducer';
import ProjectAdminParticipants, {
  PROJECT_ADMIN_PARTICIPANT_PAGINATION,
} from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipants/ProjectAdminParticipants';
import { useProjectAdminParticipantsContext } from './ProjectAdminParticipant.context';
import PickableList from '~ui/List/PickableList';
import ProjectAdminParticipantsPlaceholder from './ProjectAdminParticipantsPlaceholder';

type Props = {|
  +projectId: string,
  +dataPrefetch: ResultPreloadQuery,
|};

type PropsQuery = {|
  ...Query,
  props: ProjectAdminParticipantTabQueryResponse,
|};

const createQueryVariables = (
  projectId: string,
  parameters: ProjectAdminParticipantParameters,
): ProjectAdminParticipantTabQueryVariables => ({
  projectId,
  count: PROJECT_ADMIN_PARTICIPANT_PAGINATION,
  cursor: null,
  orderBy: {
    field: 'ACTIVITY',
    direction: parameters.sort === 'newest' ? 'DESC' : 'ASC',
  },
  term: parameters.filters.term,
  userType: parameters.filters.type === 'ALL' ? null : parameters.filters.type,
  step: parameters.filters.step === 'ALL' ? null : parameters.filters.step,
  contribuableId: parameters.filters.step === 'ALL' ? projectId : parameters.filters.step,
});

export const queryParticipant = graphql`
  query ProjectAdminParticipantTabQuery(
    $projectId: ID!
    $count: Int!
    $cursor: String
    $orderBy: UserOrder!
    $term: String
    $userType: ID
    $step: ID
    $contribuableId: ID
  ) {
    project: node(id: $projectId) {
      ...ProjectAdminParticipants_project
        @arguments(
          projectId: $projectId
          count: $count
          cursor: $cursor
          orderBy: $orderBy
          term: $term
          userType: $userType
          step: $step
          contribuableId: $contribuableId
        )
    }
  }
`;

export const initialVariables = (projectId: string) => ({
  count: PROJECT_ADMIN_PARTICIPANT_PAGINATION,
  cursor: null,
  orderBy: {
    field: 'ACTIVITY',
    direction: 'DESC',
  },
  term: null,
  userType: null,
  step: null,
  contribuableId: projectId,
});

const ProjectAdminParticipantTab = ({ projectId, dataPrefetch }: Props) => {
  const { parameters } = useProjectAdminParticipantsContext();
  const { props: dataPreloaded } = usePreloadedQuery(dataPrefetch);
  const queryVariablesWithParameters = createQueryVariables(projectId, parameters);
  const hasFilters: boolean = !isEqual(
    { projectId, ...initialVariables(projectId) },
    queryVariablesWithParameters,
  );

  const { props: data, error, retry }: PropsQuery = useQuery(
    queryParticipant,
    queryVariablesWithParameters,
    {
      skip: !hasFilters,
    },
  );

  if (
    (!hasFilters && dataPreloaded && dataPreloaded.project) ||
    (hasFilters && data && data.project)
  ) {
    const project: any = dataPreloaded && !hasFilters ? dataPreloaded.project : data.project;

    return (
      <PickableList.Provider>
        <ProjectAdminParticipants project={project} />
      </PickableList.Provider>
    );
  }

  return (
    <ReactPlaceholder
      ready={false}
      customPlaceholder={
        <ProjectAdminParticipantsPlaceholder hasError={!!error} fetchData={retry} />
      }
    />
  );
};

export default ProjectAdminParticipantTab;
