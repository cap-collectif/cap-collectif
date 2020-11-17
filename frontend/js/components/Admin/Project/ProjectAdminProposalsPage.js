// @flow
import React from 'react';
import { useQuery, graphql, usePreloadedQuery } from 'relay-hooks';
import isEqual from 'lodash/isEqual';
import ReactPlaceholder from 'react-placeholder';
import { connect } from 'react-redux';
import type {
  ProjectAdminProposalsPageQueryResponse,
  ProjectAdminProposalsPageQueryVariables,
  ProposalOrderField,
  OrderDirection,
} from '~relay/ProjectAdminProposalsPageQuery.graphql';
import type { ResultPreloadQuery, Query, GlobalState } from '~/types';
import type { ProjectAdminPageParameters, SortValues } from './ProjectAdminPage.reducer';
import ProjectAdminProposals, {
  PROJECT_ADMIN_PROPOSAL_PAGINATION,
} from '~/components/Admin/Project/ProjectAdminProposals';
import { useProjectAdminProposalsContext } from './ProjectAdminPage.context';
import ProjectAdminProposalsPlaceholder from './ProjectAdminProposalsPlaceholder';
import NoCollectStep from '~/components/Admin/Project/NoCollectStep';

type ReduxProps = {|
  +proposalRevisionsEnabled: boolean,
|};

type Props = {|
  ...ReduxProps,
  +projectId: string,
  +dataPrefetch: ResultPreloadQuery,
  +hasCollectStep: boolean,
|};

type PropsQuery = {|
  ...Query,
  props: ProjectAdminProposalsPageQueryResponse,
|};

const getSortField = (sortType: SortValues): ProposalOrderField => {
  switch (sortType) {
    case 'most-votes':
    case 'least-votes':
      return `VOTES`;
    case 'most-points':
    case 'least-points':
      return `POINTS`;
    case 'newest':
    case 'oldest':
    default:
      return `PUBLISHED_AT`;
  }
};
const getSortType = (sortType: SortValues): OrderDirection => {
  switch (sortType) {
    case 'oldest':
    case 'least-votes':
    case 'least-points':
      return 'ASC';
    case 'newest':
    case 'most-votes':
    case 'most-points':
    default:
      return 'DESC';
  }
};

const createQueryVariables = (
  projectId: string,
  parameters: ProjectAdminPageParameters,
  proposalRevisionsEnabled: boolean = false,
): ProjectAdminProposalsPageQueryVariables => ({
  projectId,
  count: PROJECT_ADMIN_PROPOSAL_PAGINATION,
  proposalRevisionsEnabled,
  cursor: null,
  orderBy: {
    field: getSortField(parameters.sort),
    direction: getSortType(parameters.sort),
  },
  state: parameters.filters.state,
  category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
  district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
  theme: parameters.filters.theme === 'ALL' ? null : parameters.filters.theme,
  step: parameters.filters.step || null,
  status: parameters.filters.status === 'ALL' ? null : parameters.filters.status,
  term: parameters.filters.term,
});

export const queryProposals = graphql`
  query ProjectAdminProposalsPageQuery(
    $projectId: ID!
    $count: Int!
    $proposalRevisionsEnabled: Boolean!
    $cursor: String
    $orderBy: ProposalOrder!
    $state: ProposalsState!
    $category: ID
    $district: ID
    $theme: ID
    $status: ID
    $step: ID
    $term: String
  ) {
    project: node(id: $projectId) {
      ...NoCollectStep_project
      ...ProjectAdminProposals_project
        @arguments(
          projectId: $projectId
          count: $count
          proposalRevisionsEnabled: $proposalRevisionsEnabled
          cursor: $cursor
          orderBy: $orderBy
          state: $state
          category: $category
          district: $district
          theme: $theme
          status: $status
          step: $step
          term: $term
        )
    }
    themes {
      ...ProjectAdminProposals_themes
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
  theme: null,
  step: null,
  status: null,
  term: null,
};

const ProjectAdminProposalsPage = ({
  projectId,
  hasCollectStep,
  dataPrefetch,
  proposalRevisionsEnabled,
}: Props) => {
  const { parameters, firstCollectStepId } = useProjectAdminProposalsContext();

  const { props: dataPreloaded } = usePreloadedQuery(dataPrefetch);
  const queryVariablesWithParameters = createQueryVariables(
    projectId,
    parameters,
    proposalRevisionsEnabled,
  );

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

  if (!hasCollectStep && dataPreloaded && dataPreloaded.project) {
    const project: any = dataPreloaded?.project;

    return <NoCollectStep project={project} />;
  }

  if (
    (hasCollectStep && !hasFilters && dataPreloaded && dataPreloaded.project) ||
    (hasFilters && data && data.project)
  ) {
    const project: any = dataPreloaded && !hasFilters ? dataPreloaded.project : data.project;
    const themes: any = dataPreloaded && !hasFilters ? dataPreloaded.themes : data.themes;

    return <ProjectAdminProposals project={project} themes={themes} />;
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

const mapStateToProps = (state: GlobalState) => ({
  proposalRevisionsEnabled: state.default.features.proposal_revisions ?? false,
});

export default connect(mapStateToProps)(ProjectAdminProposalsPage);
