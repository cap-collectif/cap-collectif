// @flow
import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { graphql, usePreloadedQuery, useQuery } from 'relay-hooks';
import ReactPlaceholder from 'react-placeholder';
import { connect } from 'react-redux';
import type { ResultPreloadQuery, Query, GlobalState } from '~/types';
import type {
  ProjectAdminAnalysisTabQueryResponse,
  ProjectAdminAnalysisTabQueryVariables,
} from '~relay/ProjectAdminAnalysisTabQuery.graphql';
import type {
  ProjectAdminPageParameters,
  SortValues,
} from '~/components/Admin/Project/ProjectAdminPage.reducer';
import ProjectAdminAnalysis, {
  PROJECT_ADMIN_PROPOSAL_PAGINATION,
} from '~/components/Admin/Project/ProjectAdminAnalysis';
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context';
import PickableList from '~ui/List/PickableList';
import ProjectAdminAnalysisPlaceholder from './ProjectAdminAnalysisPlaceholder';
import type {
  OrderDirection,
  ProposalOrderField,
} from '~relay/ProjectAdminProposalsPageQuery.graphql';
import { ORDER_BY } from '~/components/Analysis/AnalysisFilter/AnalysisFilterSort';

type ReduxProps = {|
  +proposalRevisionsEnabled: boolean,
|};

type Props = {|
  ...ReduxProps,
  +projectId: string,
  +dataPrefetch: ResultPreloadQuery,
|};

type PropsQuery = {|
  ...Query,
  props: ProjectAdminAnalysisTabQueryResponse,
|};

const getSortField = (sortType: SortValues): ProposalOrderField | 'REVISION_AT' => {
  switch (sortType) {
    case ORDER_BY.MOST_RECENT_REVISIONS:
    case ORDER_BY.LEAST_RECENT_REVISIONS:
      return 'REVISION_AT';
    case ORDER_BY.NEWEST:
    case ORDER_BY.OLDEST:
    default:
      return `PUBLISHED_AT`;
  }
};

const getSortType = (sortType: SortValues): OrderDirection => {
  switch (sortType) {
    case ORDER_BY.LEAST_RECENT_REVISIONS:
    case ORDER_BY.OLDEST:
      return 'ASC';
    case ORDER_BY.NEWEST:
    case ORDER_BY.MOST_RECENT_REVISIONS:
    default:
      return 'DESC';
  }
};

const createQueryVariables = (
  projectId: string,
  parameters: ProjectAdminPageParameters,
  proposalRevisionsEnabled: boolean = false,
): ProjectAdminAnalysisTabQueryVariables => ({
  projectId,
  count: PROJECT_ADMIN_PROPOSAL_PAGINATION,
  proposalRevisionsEnabled,
  cursor: null,
  orderBy: {
    field: getSortField(parameters.sort),
    direction: getSortType(parameters.sort),
  },
  category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
  district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
  theme: parameters.filters.theme === 'ALL' ? null : parameters.filters.theme,
  term: parameters.filters.term,
  analysts: parameters.filters.analysts.length > 0 ? parameters.filters.analysts : null,
  supervisor: parameters.filters.supervisor,
  decisionMaker: parameters.filters.decisionMaker,
  progressStatus:
    parameters.filters.progressState === 'ALL' ? null : parameters.filters.progressState,
});

export const queryAnalysis = graphql`
  query ProjectAdminAnalysisTabQuery(
    $projectId: ID!
    $count: Int!
    $proposalRevisionsEnabled: Boolean!
    $cursor: String
    $orderBy: ProposalOrder!
    $category: ID
    $district: ID
    $theme: ID
    $status: ID
    $term: String
    $analysts: [ID!]
    $supervisor: ID
    $decisionMaker: ID
    $progressStatus: ProposalProgressState
  ) {
    defaultUsers: users(first: 20) {
      edges {
        node {
          id
          ...UserSearchDropdownChoice_user
        }
      }
    }
    project: node(id: $projectId) {
      ...ProjectAdminAnalysis_project
        @arguments(
          projectId: $projectId
          count: $count
          proposalRevisionsEnabled: $proposalRevisionsEnabled
          cursor: $cursor
          orderBy: $orderBy
          category: $category
          district: $district
          theme: $theme
          status: $status
          term: $term
          analysts: $analysts
          supervisor: $supervisor
          decisionMaker: $decisionMaker
          progressStatus: $progressStatus
        )
    }
    themes {
      ...ProjectAdminAnalysis_themes
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
  category: null,
  district: null,
  theme: null,
  term: null,
  analysts: null,
  supervisor: null,
  decisionMaker: null,
  progressStatus: null,
};

const ProjectAdminAnalysisTab = ({ projectId, dataPrefetch, proposalRevisionsEnabled }: Props) => {
  const { parameters } = useProjectAdminProposalsContext();
  const { props: dataPreloaded } = usePreloadedQuery(dataPrefetch);
  const queryVariablesWithParameters = createQueryVariables(
    projectId,
    parameters,
    proposalRevisionsEnabled,
  );
  const hasFilters: boolean = !isEqual(
    { projectId, ...initialVariables },
    queryVariablesWithParameters,
  );

  const { props: data, error, retry }: PropsQuery = useQuery(
    queryAnalysis,
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
    const defaultUsers: any =
      dataPreloaded && !hasFilters ? dataPreloaded.defaultUsers : data.defaultUsers;
    const themes: any = dataPreloaded && !hasFilters ? dataPreloaded.themes : data.themes;

    return (
      <PickableList.Provider>
        <ProjectAdminAnalysis project={project} defaultUsers={defaultUsers} themes={themes} />
      </PickableList.Provider>
    );
  }

  return (
    <ReactPlaceholder
      ready={false}
      customPlaceholder={<ProjectAdminAnalysisPlaceholder hasError={!!error} fetchData={retry} />}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  proposalRevisionsEnabled: state.default.features.proposal_revisions ?? false,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ProjectAdminAnalysisTab);
