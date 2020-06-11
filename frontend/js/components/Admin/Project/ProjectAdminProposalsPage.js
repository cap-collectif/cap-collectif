// @flow
import React from 'react';
import { useQuery, graphql, usePreloadedQuery } from 'relay-hooks';
import isEqual from 'lodash/isEqual';
import ReactPlaceholder from 'react-placeholder';
import type {
  ProjectAdminProposalsPageQueryResponse,
  ProjectAdminProposalsPageQueryVariables,
} from '~relay/ProjectAdminProposalsPageQuery.graphql';
import type { ResultPreloadQuery, Query } from '~/types';
import type { ProjectAdminPageParameters } from './ProjectAdminPage.reducer';
import ProjectAdminProposals, {
  PROJECT_ADMIN_PROPOSAL_PAGINATION,
} from '~/components/Admin/Project/ProjectAdminProposals';
import { useProjectAdminProposalsContext } from './ProjectAdminPage.context';
import ProjectAdminProposalsPlaceholder from './ProjectAdminProposalsPlaceholder';

type Props = {|
  +projectId: string,
  +dataPrefetch: ResultPreloadQuery,
|};

type PropsQuery = {|
  ...Query,
  props: ProjectAdminProposalsPageQueryResponse,
|};

const createQueryVariables = (
  projectId: string,
  parameters: ProjectAdminPageParameters,
): ProjectAdminProposalsPageQueryVariables => ({
  projectId,
  count: PROJECT_ADMIN_PROPOSAL_PAGINATION,
  cursor: null,
  orderBy: {
    field: 'PUBLISHED_AT',
    direction: parameters.sort === 'newest' ? 'DESC' : 'ASC',
  },
  state: parameters.filters.state,
  category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
  district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
  step: parameters.filters.step || null,
  status: parameters.filters.status === 'ALL' ? null : parameters.filters.status,
  term: parameters.filters.term,
});

export const queryProposals = graphql`
  query ProjectAdminProposalsPageQuery(
    $projectId: ID!
    $count: Int!
    $cursor: String
    $orderBy: ProposalOrder!
    $state: ProposalsState!
    $category: ID
    $district: ID
    $status: ID
    $step: ID
    $term: String
  ) {
    project: node(id: $projectId) {
      ...ProjectAdminProposals_project
        @arguments(
          projectId: $projectId
          count: $count
          cursor: $cursor
          orderBy: $orderBy
          state: $state
          category: $category
          district: $district
          status: $status
          step: $step
          term: $term
        )
    }
  }
`;

export const initialVariables = {
  count: PROJECT_ADMIN_PROPOSAL_PAGINATION,
  cursor: null,
  orderBy: {
    field: 'PUBLISHED_AT',
    direction: 'DESC',
  },
  state: 'PUBLISHED',
  category: null,
  district: null,
  step: null,
  status: null,
  term: null,
};

const ProjectAdminProposalsPage = ({ projectId, dataPrefetch }: Props) => {
  const { parameters, firstCollectStepId } = useProjectAdminProposalsContext();

  const { props: dataPreloaded } = usePreloadedQuery(dataPrefetch);
  const queryVariablesWithParameters = createQueryVariables(projectId, parameters);

  const hasFilters: boolean = !isEqual(
    {
      ...initialVariables,
      projectId,
      step: firstCollectStepId,
    },
    queryVariablesWithParameters,
  );

  const { props: data, error, retry }: PropsQuery = useQuery(
    queryProposals,
    queryVariablesWithParameters,
    {
      fetchPolicy: 'store-or-network',
      skip: !hasFilters,
    },
  );

  if (
    (!hasFilters && dataPreloaded && dataPreloaded.project) ||
    (hasFilters && data && data.project)
  ) {
    const project: any = dataPreloaded && !hasFilters ? dataPreloaded.project : data.project;

    return <ProjectAdminProposals project={project} />;
  }

  return (
    <ReactPlaceholder
      ready={false}
      customPlaceholder={
        <ProjectAdminProposalsPlaceholder
          hasError={!!error}
          fetchData={retry}
          selectedTab={parameters.filters.state}
        />
      }
    />
  );
};

export default ProjectAdminProposalsPage;
