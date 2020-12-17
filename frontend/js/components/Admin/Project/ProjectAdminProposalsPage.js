// @flow
import * as React from 'react';
import { useQuery, graphql } from 'relay-hooks';
import { createFragmentContainer } from 'react-relay';
import isEqual from 'lodash/isEqual';
import ReactPlaceholder from 'react-placeholder';
import { connect } from 'react-redux';
import type {
  ProjectAdminProposalsPageQueryResponse,
  ProjectAdminProposalsPageQueryVariables,
  ProposalOrderField,
  OrderDirection,
} from '~relay/ProjectAdminProposalsPageQuery.graphql';
import type { ProjectAdminProposalsPage_query } from '~relay/ProjectAdminProposalsPage_query.graphql';
import type { Query, GlobalState } from '~/types';
import type { ProjectAdminPageParameters, SortValues } from './ProjectAdminPage.reducer';
import ProjectAdminProposals, {
  PROJECT_ADMIN_PROPOSAL_PAGINATION,
} from '~/components/Admin/Project/ProjectAdminProposals';
import { useProjectAdminProposalsContext } from './ProjectAdminPage.context';
import ProjectAdminProposalsPlaceholder from './ProjectAdminProposalsPlaceholder';

type ReduxProps = {|
  +proposalRevisionsEnabled: boolean,
|};

type Props = {|
  ...ReduxProps,
  +query: ProjectAdminProposalsPage_query,
  +projectId: string,
  +hasContributionsStep: boolean,
  +baseUrl: string,
|};

type PropsQuery = {|
  ...Query,
  props: ProjectAdminProposalsPageQueryResponse,
|};

type VariableQuery = {|
  +count: number,
  +cursor: ?string,
  +orderBy: {|
    +field: 'VOTES' | 'POINTS' | 'PUBLISHED_AT',
    +direction: 'ASC' | 'DESC',
  |},
  +state: string,
  +category: ?string,
  +district: ?string,
  +theme: ?string,
  +step: ?string,
  +status: ?string,
  +term: ?string,
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

export const createQueryVariables = (
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

export const renameInitialVariable = ({
  count,
  cursor,
  orderBy,
  state,
  category,
  district,
  theme,
  step,
  status,
  term,
}: VariableQuery) => ({
  countProposalPagination: count,
  cursorProposalPagination: cursor,
  proposalOrderBy: orderBy,
  proposalState: state,
  proposalCategory: category,
  proposalDistrict: district,
  proposalTheme: theme,
  proposalStatus: status,
  proposalStep: step,
  proposalTerm: term,
});

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
  query: dataPreloaded,
  projectId,
  proposalRevisionsEnabled,
  hasContributionsStep,
  baseUrl,
}: Props) => {
  const { parameters, firstCollectStepId } = useProjectAdminProposalsContext();

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
      proposalRevisionsEnabled,
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

  if ((!hasFilters && dataPreloaded) || (hasFilters && data)) {
    const project: any = dataPreloaded && !hasFilters ? dataPreloaded.project : data.project;
    const themes: any = dataPreloaded && !hasFilters ? dataPreloaded.themes : data.themes;

    return (
      <ProjectAdminProposals
        project={project}
        themes={themes}
        hasContributionsStep={hasContributionsStep}
        baseUrl={baseUrl}
      />
    );
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

export default createFragmentContainer(connect(mapStateToProps)(ProjectAdminProposalsPage), {
  query: graphql`
    fragment ProjectAdminProposalsPage_query on Query
      @argumentDefinitions(
        projectId: { type: "ID!" }
        count: { type: "Int!" }
        proposalRevisionsEnabled: { type: "Boolean!" }
        cursor: { type: "String" }
        orderBy: { type: "ProposalOrder!", defaultValue: { field: PUBLISHED_AT, direction: DESC } }
        state: { type: "ProposalsState!", defaultValue: ALL }
        category: { type: "ID", defaultValue: null }
        district: { type: "ID", defaultValue: null }
        theme: { type: "ID", defaultValue: null }
        status: { type: "ID", defaultValue: null }
        step: { type: "ID", defaultValue: null }
        term: { type: "String", defaultValue: null }
      ) {
      project: node(id: $projectId) {
        id
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
  `,
});
