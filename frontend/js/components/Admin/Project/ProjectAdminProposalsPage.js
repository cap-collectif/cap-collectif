// @flow
import * as React from 'react';
import { useQuery, graphql } from 'relay-hooks';
import { createFragmentContainer } from 'react-relay';
import isEqual from 'lodash/isEqual';
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
import Skeleton from '~ds/Skeleton';

type ReduxProps = {|
  +proposalRevisionsEnabled: boolean,
  +viewerIsAdmin: boolean,
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
  +viewerIsAdmin: boolean,
  +count: number,
  +cursor: ?string,
  +orderBy: {|
    +field: 'VOTES' | 'POINTS' | 'PUBLISHED_AT' | 'NUMBER_OF_MESSAGES_RECEIVED',
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
      return `VOTES`;
    case 'least-votes':
      return `VOTES`;
    case 'most-points':
      return `POINTS`;
    case 'least-points':
      return `POINTS`;
    case 'newest':
      return `PUBLISHED_AT`;
    case 'oldest':
      return `PUBLISHED_AT`;
    case 'most-messages-received':
      return `NUMBER_OF_MESSAGES_RECEIVED`;
    case 'least-messages-received':
      return `NUMBER_OF_MESSAGES_RECEIVED`;
    default:
      return `PUBLISHED_AT`;
  }
};
const getSortType = (sortType: SortValues): OrderDirection => {
  switch (sortType) {
    case 'oldest':
      return 'ASC';
    case 'least-votes':
      return 'ASC';
    case 'least-points':
      return 'ASC';
    case 'newest':
      return 'DESC';
    case 'most-votes':
      return 'DESC';
    case 'most-points':
      return 'DESC';
    case 'most-messages-received':
      return 'DESC';
    case 'least-messages-received':
      return 'ASC';
    default:
      return 'DESC';
  }
};

export const createQueryVariables = (
  projectId: string,
  parameters: ProjectAdminPageParameters,
  proposalRevisionsEnabled: boolean = false,
  viewerIsAdmin: boolean,
): ProjectAdminProposalsPageQueryVariables => ({
  projectId,
  viewerIsAdmin,
  count: PROJECT_ADMIN_PROPOSAL_PAGINATION,
  proposalRevisionsEnabled,
  cursor: null,
  orderBy: [
    {
      field: getSortField(parameters.sort),
      direction: getSortType(parameters.sort),
    },
  ],
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
    $viewerIsAdmin: Boolean!
    $count: Int!
    $proposalRevisionsEnabled: Boolean!
    $cursor: String
    $orderBy: [ProposalOrder!]
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
          viewerIsAdmin: $viewerIsAdmin
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
  viewerIsAdmin,
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
  viewerIsAdmin,
});

export const initialVariables = (viewerIsAdmin: boolean) => ({
  count: PROJECT_ADMIN_PROPOSAL_PAGINATION,
  viewerIsAdmin,
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
});

const ProjectAdminProposalsPage = ({
  query: dataPreloaded,
  projectId,
  proposalRevisionsEnabled,
  hasContributionsStep,
  viewerIsAdmin,
  baseUrl,
}: Props) => {
  const { parameters, firstCollectStepId } = useProjectAdminProposalsContext();

  const queryVariablesWithParameters = createQueryVariables(
    projectId,
    parameters,
    proposalRevisionsEnabled,
    viewerIsAdmin,
  );

  const hasFilters: boolean = !isEqual(
    {
      ...initialVariables(viewerIsAdmin),
      projectId,
      step: firstCollectStepId,
      proposalRevisionsEnabled,
    },
    queryVariablesWithParameters,
  );

  const {
    props: data,
    error,
    retry,
  }: PropsQuery = useQuery(queryProposals, queryVariablesWithParameters, {
    fetchPolicy: 'store-or-network',
    skip: !hasFilters,
  });

  return (
    <Skeleton
      isLoaded={(!hasFilters && !!dataPreloaded) || (hasFilters && !!data)}
      placeholder={
        <ProjectAdminProposalsPlaceholder
          hasError={!!error}
          fetchData={retry}
          selectedTab={parameters.filters.state}
        />
      }>
      <ProjectAdminProposals
        project={dataPreloaded && !hasFilters ? dataPreloaded.project : data?.project}
        themes={dataPreloaded && !hasFilters ? dataPreloaded.themes : data?.themes}
        hasContributionsStep={hasContributionsStep}
        baseUrl={baseUrl}
      />
    </Skeleton>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  proposalRevisionsEnabled: state.default.features.proposal_revisions ?? false,
  viewerIsAdmin: state.user.user ? state.user.user.isAdmin : false,
});

export default createFragmentContainer(
  connect<any, any, _, _, _, _>(mapStateToProps)(ProjectAdminProposalsPage),
  {
    query: graphql`
      fragment ProjectAdminProposalsPage_query on Query
      @argumentDefinitions(
        projectId: { type: "ID!" }
        viewerIsAdmin: { type: "Boolean!" }
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
              viewerIsAdmin: $viewerIsAdmin
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
  },
);
