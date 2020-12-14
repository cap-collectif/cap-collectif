// @flow
import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { usePreloadedQuery, graphql } from 'relay-hooks';
import NoContributionsStep from '~/components/Admin/Project/ProjectAdminContributions/NoContributions/NoContributionsStep';
import ProjectAdminDebate from './ProjectAdminDebateStep/ProjectAdminDebate';
import { ProjectAdminProposalsProvider } from '~/components/Admin/Project/ProjectAdminPage.context';
import IndexContributions, { getContributionsPath } from './IndexContributions/IndexContributions';
import AppBox from '~ui/Primitives/AppBox';
import type { ResultPreloadQuery } from '~/types';
import Loader from '~ui/FeedbacksIndicators/Loader';
import ProjectAdminProposalsPage from '~/components/Admin/Project/ProjectAdminProposalsPage';

type Props = {|
  +dataPrefetch: ResultPreloadQuery,
  +projectId: string,
|};

export const queryContributions = graphql`
  query ProjectAdminContributionsPageQuery(
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
      ... on Project {
        firstCollectStep {
          id
        }
        steps {
          id
          __typename
          slug
          ...ProjectAdminDebate_step
        }
        ...NoContributionsStep_project
        ...IndexContributions_project
      }
    }
    ...ProjectAdminProposalsPage_query
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
`;

const ProjectAdminContributionsPage = ({ dataPrefetch, projectId }: Props) => {
  const { props: dataPreloaded } = usePreloadedQuery(dataPrefetch);
  const { path: baseUrl } = useRouteMatch();

  if (!dataPreloaded?.project) return <Loader />;

  const { project } = dataPreloaded;

  const collectSteps = project.steps.filter(step => step.__typename === 'CollectStep');
  const debateSteps = project.steps.filter(step => step.__typename === 'DebateStep');

  const hasCollectStep = collectSteps.length > 0;
  const hasDebateStep = debateSteps.length > 0;
  const hasAtLeastOneContributionsStep = hasCollectStep || hasDebateStep;

  const hasIndex =
    collectSteps.length > 1 ||
    debateSteps.length > 1 ||
    (collectSteps.length === 1 && debateSteps.length === 1);

  return (
    <AppBox m="2rem">
      <Switch>
        <Route exact path={baseUrl}>
          {!hasAtLeastOneContributionsStep ? (
            <NoContributionsStep project={project} />
          ) : (
            <IndexContributions project={project} />
          )}
        </Route>

        <Route path={getContributionsPath(baseUrl, 'CollectStep')}>
          <ProjectAdminProposalsProvider firstCollectStepId={project.firstCollectStep?.id}>
            <ProjectAdminProposalsPage
              hasContributionsStep={hasIndex}
              projectId={projectId}
              query={dataPreloaded}
              baseUrl={baseUrl}
            />
          </ProjectAdminProposalsProvider>
        </Route>

        <Route
          path={getContributionsPath(baseUrl, 'DebateStep')}
          component={routeProps => (
            <ProjectAdminDebate
              hasContributionsStep={hasIndex}
              baseUrl={baseUrl}
              step={project?.steps.find(({ slug }) => slug === routeProps.match.params.stepSlug)}
              {...routeProps}
            />
          )}
        />
      </Switch>
    </AppBox>
  );
};

export default ProjectAdminContributionsPage;
