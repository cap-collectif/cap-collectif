// @flow
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import Loader from '~/components/Ui/FeedbacksIndicators/Loader';
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql';
import ScrollToTop from '~/components/Utils/ScrollToTop';
import AnalysisListProjectPage from '~/components/Analysis/AnalysisListProjectPage/AnalysisListProjectPage';
import AnalysisProjectPage from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage';

const BASE_URL_ANALYSIS = '/evaluations';

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

    if (dataProjects && dataProjects.length > 0) {
      return (
        <Router basename={BASE_URL_ANALYSIS}>
          <ScrollToTop />

          <Switch>
            <Route exact path="/">
              {dataProjects.length === 1 ? (
                <Redirect to={`/project/${dataProjects[0].slug}`} />
              ) : (
                <AnalysisListProjectPage projects={dataProjects} />
              )}
            </Route>

            <Route
              exact
              path="/project/:projectSlug"
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

const AnalysisIndexPage = () => (
  <QueryRenderer
    environment={environment}
    variables={{}}
    query={graphql`
      query AnalysisIndexPageQuery {
        projects {
          edges {
            node {
              slug
              ...AnalysisListProjectPage_projects
              ...AnalysisProjectPage_project
            }
          }
        }
      }
    `}
    render={renderComponent}
  />
);

export default AnalysisIndexPage;
