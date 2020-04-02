// @flow
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import Loader from '~/components/Ui/FeedbacksIndicators/Loader';
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql';
import ScrollToTop from '~/components/Utils/ScrollToTop';
import AnalysisListProjectPage from '~/components/Analysis/AnalysisListProjectPage/AnalysisListProjectPage';
import AnalysisProjectPage, {
  ANALYSIS_PROJECT_PROPOSALS_PAGINATION,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage';
import AnalysisHeader from '~/components/Analysis/AnalysisHeader/AnalysisHeader';
import type { AnalysisProjectPageProposalsPaginatedQueryVariables } from '~relay/AnalysisProjectPageProposalsPaginatedQuery.graphql';
import type { ParametersState } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer';
import { useAnalysisProposalsContext } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';
import { ORDER_BY } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer';

const createQueryVariables = (
  parameters: ParametersState,
): $Diff<AnalysisProjectPageProposalsPaginatedQueryVariables, { projectId: any }> => ({
  count: ANALYSIS_PROJECT_PROPOSALS_PAGINATION,
  cursor: null,
  orderBy: {
    field: 'PUBLISHED_AT',
    direction: parameters.sort === ORDER_BY.NEWEST ? 'DESC' : 'ASC',
  },
  category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
  district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
});

const BASE_URL_ANALYSIS = '/evaluations';

export const PATHS = {
  INDEX: '/',
  PROJECT: '/project/:projectSlug',
};

export const renderComponent = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?AnalysisIndexPageQueryResponse,
}) => {
  if (error) return graphqlError;

  if (props) {
    const { projects } = props;
    const dataProjects = projects?.edges?.filter(Boolean).map(edge => edge.node);
    const allPaths = Object.values(PATHS);

    if (dataProjects && dataProjects.length > 0) {
      return (
        <Router basename={BASE_URL_ANALYSIS}>
          <ScrollToTop />
          <Route exact path={allPaths} component={AnalysisHeader} />

          <Switch>
            <Route exact path={PATHS.INDEX}>
              {dataProjects.length === 1 ? (
                <Redirect to={`/project/${dataProjects[0].slug}`} />
              ) : (
                <AnalysisListProjectPage projects={dataProjects} />
              )}
            </Route>

            <Route
              exact
              path={PATHS.PROJECT}
              component={routeProps => (
                <AnalysisProjectPage
                  project={dataProjects.find(
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

    return graphqlError;
  }
  return <Loader />;
};

const AnalysisIndexPage = () => {
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
        ) {
          projects {
            edges {
              node {
                slug
                ...AnalysisListProjectPage_projects
                ...AnalysisProjectPage_project
                  @arguments(
                    count: $count
                    cursor: $cursor
                    orderBy: $orderBy
                    category: $category
                    district: $district
                  )
              }
            }
          }
        }
      `}
      render={renderComponent}
    />
  );
};

export default AnalysisIndexPage;
