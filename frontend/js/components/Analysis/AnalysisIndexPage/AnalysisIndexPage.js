// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import ReactPlaceholder from 'react-placeholder';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '~/createRelayEnvironment';
import Loader from '~/components/Ui/FeedbacksIndicators/Loader';
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql';
import ScrollToTop from '~/components/Utils/ScrollToTop';
import AnalysisListProjectPage from '~/components/Analysis/AnalysisListProjectPage/AnalysisListProjectPage';
import AnalysisProjectPage, {
  ANALYSIS_PROJECT_PROPOSALS_PAGINATION,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage';
import AnalysisHeader from '~/components/Analysis/AnalysisHeader/AnalysisHeader';
import type { AnalysisProjectPageProposalsPaginatedQueryVariables } from '~relay/AnalysisProjectPageProposalsPaginatedQuery.graphql';
import { useAnalysisProposalsContext } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';
import {
  ORDER_BY,
  type AnalysisProjectPageParameters,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer';
import AnalysisPageContentPlaceholder from '~/components/Analysis/AnalysisPagePlaceholder/AnalysisPageContentPlaceholder';
import type { GlobalState } from '~/types';

const createQueryVariables = (
  parameters: AnalysisProjectPageParameters,
): $Diff<AnalysisProjectPageProposalsPaginatedQueryVariables, { projectId: any }> => ({
  count: ANALYSIS_PROJECT_PROPOSALS_PAGINATION,
  cursor: null,
  orderBy: {
    field: 'PUBLISHED_AT',
    direction: parameters.sort === ORDER_BY.NEWEST ? 'DESC' : 'ASC',
  },
  category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
  district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
  analysts: parameters.filters.analysts.length > 0 ? parameters.filters.analysts : null,
  supervisor: parameters.filters.supervisor,
  decisionMaker: parameters.filters.decisionMaker,
  state: parameters.filters.state === 'ALL' ? null : parameters.filters.state,
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
    const { viewerAssignedProjectsToAnalyse: projects, defaultUsers } = props;
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
                  {...routeProps}
                />
              )}
            />
          </Switch>
        </Router>
      );
    }
  }

  if (window.location.pathname === BASE_URL_ANALYSIS) {
    return (
      <ReactPlaceholder
        ready={false}
        customPlaceholder={
          <AnalysisPageContentPlaceholder
            isProjectPage
            hasError={!!error || (!!props && !props?.viewerAssignedProjectsToAnalyse)}
            fetchData={retry}
          />
        }
      />
    );
  }

  if (window.location.pathname !== BASE_URL_ANALYSIS) {
    return (
      <ReactPlaceholder
        ready={false}
        customPlaceholder={
          <AnalysisPageContentPlaceholder
            hasError={!!error || (!!props && !props?.viewerAssignedProjectsToAnalyse)}
            fetchData={retry}
            selectedTab={parameters.filters.state}
          />
        }
      />
    );
  }

  return <Loader />;
};

type Props = {|
  language: string,
|};

const AnalysisIndexPage = ({ language }: Props) => {
  const { parameters } = useAnalysisProposalsContext();

  return (
    <QueryRenderer
      environment={environment}
      variables={createQueryVariables(parameters)}
      query={graphql`
        query AnalysisIndexPageQuery(
          $count: Int!
          $cursor: String
          $orderBy: ProposalOrder!
          $category: ID
          $district: ID
          $analysts: [ID!]
          $supervisor: ID
          $decisionMaker: ID
          $state: ProposalTaskState
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
                cursor: $cursor
                orderBy: $orderBy
                category: $category
                district: $district
                analysts: $analysts
                supervisor: $supervisor
                decisionMaker: $decisionMaker
                state: $state
              )
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
});

export default connect(mapStateToProps)(AnalysisIndexPage);
