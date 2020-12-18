// @flow
import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { usePreloadedQuery, graphql } from 'relay-hooks';
import NoContributionsStep from '~/components/Admin/Project/ProjectAdminContributions/NoContributions/NoContributionsStep';
import IndexContributions, { getContributionsPath } from './IndexContributions/IndexContributions';
import AppBox from '~ui/Primitives/AppBox';
import type { ResultPreloadQuery } from '~/types';
import Loader from '~ui/FeedbacksIndicators/Loader';
import ProjectAdminProposalsPage from '~/components/Admin/Project/ProjectAdminProposalsPage';
import { ProjectAdminProposalsProvider } from '~/components/Admin/Project/ProjectAdminPage.context';
import { ProjectAdminDebatePageProvider } from './ProjectAdminDebatePage/ProjectAdminDebatePage.context';
import ProjectAdminDebatePage from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebatePage/ProjectAdminDebatePage';

type Props = {|
  +dataPrefetch: ResultPreloadQuery,
  +projectId: string,
|};

export const queryContributions = graphql`
  query ProjectAdminContributionsPageQuery(
    # ARGUMENTS OF ProjectAdminProposals
    $projectId: ID!
    $countProposalPagination: Int!
    $cursorProposalPagination: String
    $proposalRevisionsEnabled: Boolean!
    $proposalOrderBy: ProposalOrder!
    $proposalState: ProposalsState!
    $proposalCategory: ID
    $proposalDistrict: ID
    $proposalTheme: ID
    $proposalStatus: ID
    $proposalStep: ID
    $proposalTerm: String
    # ARGUMENTS OF ProjectAdminDebate (DebateArgument)
    $countArgumentPagination: Int!
    $cursorArgumentPagination: String
    $argumentType: ForOrAgainstValue
    $isPublishedArgument: Boolean!
    $isTrashedArgument: Boolean!
    # ARGUMENTS OF ProjectAdminDebate (DebateVote)
    $countVotePagination: Int!
    $cursorVotePagination: String
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
          ... on DebateStep {
            debate {
              id
              ...ProjectAdminDebatePage_debate
                @arguments(
                  countArgumentPagination: $countArgumentPagination
                  cursorArgumentPagination: $cursorArgumentPagination
                  argumentType: $argumentType
                  isPublishedArgument: $isPublishedArgument
                  isTrashedArgument: $isTrashedArgument
                  countVotePagination: $countVotePagination
                  cursorVotePagination: $cursorVotePagination
                )
            }
          }
        }
        ...NoContributionsStep_project
        ...IndexContributions_project
      }
    }
    ...ProjectAdminProposalsPage_query
      @arguments(
        projectId: $projectId
        count: $countProposalPagination
        cursor: $cursorProposalPagination
        proposalRevisionsEnabled: $proposalRevisionsEnabled
        orderBy: $proposalOrderBy
        state: $proposalState
        category: $proposalCategory
        district: $proposalDistrict
        theme: $proposalTheme
        status: $proposalStatus
        step: $proposalStep
        term: $proposalTerm
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
    (collectSteps.length >= 1 && debateSteps.length >= 1);

  return (
    <AppBox m={5}>
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
            <ProjectAdminDebatePageProvider>
              <ProjectAdminDebatePage
                hasContributionsStep={hasIndex}
                baseUrl={baseUrl}
                debate={
                  project?.steps.find(({ slug }) => slug === routeProps.match.params.stepSlug)
                    ?.debate
                }
                {...routeProps}
              />
            </ProjectAdminDebatePageProvider>
          )}
        />
      </Switch>
    </AppBox>
  );
};

export default ProjectAdminContributionsPage;
