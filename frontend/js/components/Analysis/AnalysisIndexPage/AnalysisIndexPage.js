// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import ReactPlaceholder from 'react-placeholder';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '~/createRelayEnvironment';
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql';
import ScrollToTop from '~/components/Utils/ScrollToTop';
import AnalysisListProjectPage from '~/components/Analysis/AnalysisListProjectPage/AnalysisListProjectPage';
import AnalysisProjectPage, {
  ANALYSIS_PROJECT_PROPOSALS_PAGINATION,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage';
import AnalysisHeader from '~/components/Analysis/AnalysisHeader/AnalysisHeader';
import { useAnalysisProposalsContext } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';
import {
  ORDER_BY,
  type AnalysisProjectPageParameters,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer';
import AnalysisPageContentPlaceholder from '~/components/Analysis/AnalysisPagePlaceholder/AnalysisPageContentPlaceholder';
import type { GlobalState } from '~/types';
import type { SortValues } from '~/components/Admin/Project/ProjectAdminPage.reducer';
import type {
  OrderDirection,
  ProposalOrderField,
} from '~relay/ProjectAdminProposalsPageQuery.graphql';
import type { AnalysisProjectPageProposalsPaginatedQueryVariables } from '~relay/AnalysisProjectPageProposalsPaginatedQuery.graphql';

const getSortField = (sortType: SortValues): ProposalOrderField => {
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
  parameters: AnalysisProjectPageParameters,
  proposalRevisionsEnabled: boolean = false,
): $Diff<AnalysisProjectPageProposalsPaginatedQueryVariables, { projectId: any }> => ({
  count: ANALYSIS_PROJECT_PROPOSALS_PAGINATION,
  proposalRevisionsEnabled,
  cursor: null,
  orderBy: {
    field: getSortField(parameters.sort),
    direction: getSortType(parameters.sort),
  },
  category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
  district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
  theme: parameters.filters.theme === 'ALL' ? null : parameters.filters.theme,
  analysts: parameters.filters.analysts.length > 0 ? parameters.filters.analysts : null,
  supervisor: parameters.filters.supervisor,
  decisionMaker: parameters.filters.decisionMaker,
  state: parameters.filters.state === 'ALL' ? null : parameters.filters.state,
  term: parameters.filters.term,
});

const BASE_URL_ANALYSIS = '/evaluations';

export const PATHS = {
  INDEX: '/',
  PROJECT: '/project/:projectSlug',
};

export const renderComponent = ({
  error,
  props,
  retry,
  parameters,
  language,
}: {
  ...ReactRelayReadyState,
  props: ?AnalysisIndexPageQueryResponse,
  parameters: AnalysisProjectPageParameters,
  language: string,
}) => {
  if (props) {
    const { viewerAssignedProjectsToAnalyse: projects, themes, defaultUsers } = props;
    const languageUrl: string = language.split('-')[0];
    const allPaths = Object.values(PATHS).map(v => String(v));

    /**
     * Why the Redirect from="/evaluations" ?
     * We have to force the language in url to be sure of the basename for the url
     */
    if (projects && projects.length > 0) {
      return (
        <Router basename={`/${languageUrl}${BASE_URL_ANALYSIS}`}>
          <ScrollToTop />

          <Route
            exact
            path={allPaths}
            component={routeProps => (
              <AnalysisHeader countProject={projects.length} {...routeProps} />
            )}
          />

          <Switch>
            <Redirect from="/evaluations" to="/" exact strict />

            <Redirect
              from={`${BASE_URL_ANALYSIS}${PATHS.PROJECT}`}
              to={PATHS.PROJECT}
              exact
              strict
            />

            <Route exact path={PATHS.INDEX}>
              {projects.length === 1 ? (
                <Redirect to={`/project/${projects[0].slug}`} />
              ) : (
                <AnalysisListProjectPage projects={projects} />
              )}
            </Route>

            <Route
              exact
              path={PATHS.PROJECT}
              component={routeProps => (
                <AnalysisProjectPage
                  defaultUsers={defaultUsers}
                  project={projects.find(
                    ({ slug }) => slug === routeProps.match.params.projectSlug,
                  )}
                  themes={themes}
                  {...routeProps}
                />
              )}
            />
          </Switch>
        </Router>
      );
    }
  }

  const hasError = !!error || (!!props && !props?.viewerAssignedProjectsToAnalyse);
  const isIndexPage = !window.location.pathname.includes('project');

  return (
    <ReactPlaceholder
      ready={false}
      children={null}
      customPlaceholder={
        <AnalysisPageContentPlaceholder
          isIndexPage={isIndexPage}
          hasError={hasError}
          fetchData={retry}
          selectedTab={isIndexPage ? null : parameters.filters.state}
        />
      }
    />
  );
};

type Props = {|
  language: string,
  proposalRevisionsEnabled: boolean,
|};

const AnalysisIndexPage = ({ language, proposalRevisionsEnabled }: Props) => {
  const { parameters } = useAnalysisProposalsContext();

  return (
    <QueryRenderer
      environment={environment}
      variables={createQueryVariables(parameters, proposalRevisionsEnabled)}
      query={graphql`
        query AnalysisIndexPageQuery(
          $count: Int!
          $proposalRevisionsEnabled: Boolean!
          $cursor: String
          $orderBy: ProposalOrder!
          $category: ID
          $district: ID
          $theme: ID
          $analysts: [ID!]
          $supervisor: ID
          $decisionMaker: ID
          $state: ProposalTaskState
          $term: String
        ) {
          defaultUsers: users(first: 20) {
            edges {
              node {
                id
                ...UserSearchDropdownChoice_user
              }
            }
          }
          viewerAssignedProjectsToAnalyse {
            slug
            ...AnalysisListProjectPage_projects
            ...AnalysisProjectPage_project
              @arguments(
                count: $count
                proposalRevisionsEnabled: $proposalRevisionsEnabled
                cursor: $cursor
                orderBy: $orderBy
                category: $category
                district: $district
                theme: $theme
                analysts: $analysts
                supervisor: $supervisor
                decisionMaker: $decisionMaker
                state: $state
                term: $term
              )
          }
          themes {
            ...AnalysisProjectPage_themes
          }
        }
      `}
      render={({ error, props, retry }) =>
        renderComponent({ error, props, retry, parameters, language })
      }
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  language: state.language.currentLanguage,
  proposalRevisionsEnabled: state.default.features.proposal_revisions ?? false,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(AnalysisIndexPage);
